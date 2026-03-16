import { impl, link, linkAsync, type Context } from 'udic';
import { SQL } from 'bun';

interface Config {
  config: {
    logLevel: 'DEBUG' | 'WARNING' | 'ERROR';
    dbUrl: string;
  };
}

// Auto infer type
type Logger = Context<typeof Logger>;
type Database = Context<typeof Database>;

const Logger = impl((c: Context<Config>) => ({
  log: (...args: any[]) => {
    console.log(`[${c.config.logLevel}]`, ...args);
  },
}));
const Database = impl((c: Context<Config>) => ({
  sql: new SQL(c.config.dbUrl),
}));

// Main
const main = async (c: Context<Database | Logger>) => {
  c.log('config:', c.config);

  c.log('start querying');
  await c.sql`SELECT 1`;
  c.log('finished querying');
};

const testCtx = await linkAsync(
  {
    config: {
      logLevel: 'DEBUG',
      dbUrl: ':memory',
    },
  },
  Logger,
  Database,
);
main(testCtx);
