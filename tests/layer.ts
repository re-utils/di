import { service, derive, layer } from 'udic';

interface TConfig {
  logLevel: string;
  connection: string;
};
const config = service('config')<TConfig>();

type TLog = (msg: string) => void;
const log = service('log')<TLog>();

interface TDB {
  query: (sql: string) => unknown
};
const db = service('db')<TDB>();

const logLayer = layer({
  log: derive(
    [config],
    ({ logLevel }): TLog => (msg) => {
      console.log(`[${logLevel}] ${msg}`);
    }
  )
}, {
  config: {
    logLevel: 'INFO',
    connection: 'mysql://username:password@hostname:port/database_name'
  }
});

const dbLayer = layer({
  db: derive(
    [config, log],
    ({ connection }, log): TDB => ({
      query: (sql: string) => {
        log('Executing query: ' + sql);
        return { result: 'Results from ' + connection };
      }
    })
  )
}, logLayer);

const main = derive([db], (db) => db.query('SELECT * FROM users'));
console.log(main(dbLayer));
