import * as di from 'udic';

const config = di.service('config')<{
  logLevel: string;
  connection: string;
}>();
const log = di.service('log')<
  (msg: string) => void
>();
const db = di.service('db')<{
  query: (sql: string) => { result: string };
}>();

// Create service implementations that depends on other services
const logImpl = di.impl(log, di.derive(
  [config],
  ({ logLevel }) => (msg) => {
    console.log(`[${logLevel}] ${msg}`);
  },
));
const dbImpl = di.impl(db, di.derive(
  [config, log],
  ({ connection }, log) => ({
    query: (sql: string) => {
      log('Executing query: ' + sql);
      return { result: 'Results from ' + connection };
    },
  }),
));

// Provide dependencies for the impl
const logCtx = di.merge([logImpl], {
  config: {
    logLevel: 'INFO',
    connection: 'mysql://username:password@hostname:port/database_name',
  },
});
const dbCtx = di.merge([dbImpl], logCtx);

// Main program use DB
const main = di.derive([db], (db) => {
  console.log(db.query('SELECT * FROM users'));
});
main(dbCtx);
