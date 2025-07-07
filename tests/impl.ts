import * as di from 'udic';

// Declarations
const config = di.service('config')<{
  logLevel: string;
  connection: string;
}>();
const log = di.service('log')<(msg: string) => void>();
const db = di.service('db')<{
  query: (sql: string) => { result: string };
}>();

const main = di.use([db], (db) => {
  console.log(db.query('SELECT * FROM users'));
});

// Implementations
const logImpl = di.impl(log, di.use(
  [config],
  (config) => (msg) => {
    console.log(`[${config.logLevel}] ${msg}`);
  })
);
const dbImpl = di.impl(db, di.use(
  [config, log],
  ({ connection }, log) => ({
    query: (sql: string) => {
      log('Executing query: ' + sql);
      return { result: 'Results from ' + connection };
    },
  })
));

// Link dependencies
const logDeps = di.link([logImpl], {
  config: {
    logLevel: 'INFO',
    connection: 'mysql://username:password@hostname:port/database_name',
  },
});
const dbDeps = di.link([dbImpl], logDeps);

// Run with linked dependencies
main(dbDeps);
