var pg = require('pg');


var dbPoolCluster = {};

var createDBPool = function (poolName, schema) {
  var pool = dbPoolCluster[poolName];
  if (pool) {
    pool.end();
  }
  dbPoolCluster[poolName] = new pg.Pool(schema);
};

var getDBPool = function (poolName, schema, logger) {
  if (!dbPoolCluster[poolName]) {
    createDBPool(poolName, schema, logger);
  }
  return dbPoolCluster[poolName];
};


module.exports = {getPool: getDBPool, createPool: createDBPool};

