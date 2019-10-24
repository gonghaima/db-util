module.exports = function () {
  return {
    databaseEngine: process.env.DATABASE_ENGINE || 'postgres',
    clusterConfig: {
      removeNodeErrorCount: 5, //requires putting the api into ReadOnly Mode
      defaultSelector: 'ORDER'
    },
    masterConfig: {
      connectionLimit: process.env.MASTER_DB_CONNECTIONLIMIT,
      host: process.env.MASTER_DB_HOSTNAME,
      user: process.env.MASTER_DB_USER,
      port: process.env.MASTER_DB_PORT,
      password: process.env.MASTER_DB_PASSWORD,
      database: process.env.MASTER_DB_NAME
    },
    slave1Config: {
      connectionLimit: process.env.SLAVE1_DB_CONNECTIONLIMIT,
      host: process.env.SLAVE1_DB_HOSTNAME,
      user: process.env.SLAVE1_DB_USER,
      port: process.env.SLAVE1_DB_PORT,
      password: process.env.SLAVE1_DB_PASSWORD,
      database: process.env.SLAVE1_DB_NAME
    },
    refDataConfig: {
      connectionLimit: process.env.REF_DB_CONNECTIONLIMIT,
      host: process.env.REF_DB_HOSTNAME,
      user: process.env.REF_DB_USER,
      port: process.env.REF_DB_PORT,
      password: process.env.REF_DB_PASSWORD,
      database: process.env.REF_DB_NAME
    }
  };
};
