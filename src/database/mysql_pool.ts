const mysqlPromisify = require('mysql-promisify-pool');

export const initializeMySQL = (config) => {
  mysqlPromisify.initialize(config.host, config.user, config.password, config.name);
};

export const getPool = async (config = null) => {
  let pool = mysqlPromisify.getPool();
  if (pool === null) {
    console.log('null pool');
    if (!config) {
      console.error('Error: MySQL connection not set');
      return null;
    }
    pool = mysqlPromisify.initialize(config.host, config.user, config.password, config.name);
    return pool;
  }
  return pool;
};
