import * as di from 'udic';

interface TConfig {
  logLevel: string;
  connection: string;
}
const config = di.service('config')<TConfig>();

type TLog = (msg: string) => void;
const log = di.service('log')<TLog>();

interface TDB {
  query: (sql: string) => unknown;
}
const db = di.service('db')<TDB>();

// Create service implementations that depends on other services
const logLayer = di.layer(log, di.derive(
  [config],
  ({ logLevel }): TLog =>
    (msg) => {
      console.log(`[${logLevel}] ${msg}`);
    },
));

const dbLayer = di.layer(db, di.derive(
  [config, log],
  ({ connection }, log): TDB => ({
    query: (sql: string) => {
      log('Executing query: ' + sql);
      return { result: 'Results from ' + connection };
    },
  }),
));

// Provide implementations for the layer
const logLive = di.provide([logLayer], {
  config: {
    logLevel: 'INFO',
    connection: 'mysql://username:password@hostname:port/database_name',
  },
});
const dbLive = di.provide([dbLayer], logLive);

const main = di.derive([db], (db) => db.query('SELECT * FROM users'));
console.log(main(dbLive));
