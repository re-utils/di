import * as di from 'udic';

type Config = {
  config: {
    logLevel: string;
    connection: string;
  }
}

const Logger = di.impl(({ config: { logLevel } }: di.Context<Config>) => ({
  logger: (msg: string) => {
    console.log(`[${logLevel}] ${msg}`);
  },
}));

const Database = di.implAsync(
  async ({
    config: { connection },
    logger,
  }: di.Context<Config | typeof Logger>) => ({
    db: {
      query: async (sql: string) => {
        logger('Executing query: ' + sql);
        return { result: 'Results from ' + connection };
      },
    },
  }),
);

const c = await di.linkAsync(
  di.link(
    {
      config: {
        logLevel: 'DEBUG',
        connection: 'postgres://localhost:1234',
      },
    },
    Logger,
  ),
  Database,
);

console.log(await c.db.query('SELECT * FROM users'));
