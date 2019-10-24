var _ = require('lodash');
var dbPoolCluster = require('./db-pool-cluster');
var generateConfig = require('../db-config');


var config = generateConfig();
var cleanSchema = function (schema) {
  return _.assign(_.omit(schema, ['connectionLimit']), {max: schema.connectionLimit});
};

var buildQuery = function (procedure, params, client) {
  var p = _.map(_.range(params.length), function (n) {
    return "$" + (n + 1);
  }).join(',');
  var command = "select * from sp_" + procedure + client.escape("(" + p + ")");
  return {
    text: command,
    values: params
  };
};

var executeRead = function (procedure, params, consistent, callback) {
  var refDataConfigProvided = config && config.refDataConfig && config.refDataConfig.host;
  var readConfig = refDataConfigProvided ? config.refDataConfig : config.slave1Config;
  var dbConnectionOpts = cleanSchema(readConfig);
  executeQuery(dbConnectionOpts, procedure, params, consistent, callback, 'READ_POOL');
};

var executeWrite = function (procedure, params, consistent, callback) {
  var dbConnectionOpts = cleanSchema(config.masterConfig);
  executeQuery(dbConnectionOpts, procedure, params, consistent, callback, 'WRITE_POOL');
};

var executeQuery = function (schema, procedure, params, consistent, callback, poolName) {
  var dbPool = dbPoolCluster.getPool(poolName, schema);

  var postQueryProcessCallback = function (error, result, reCreateDbPoolRequired) {
    if (reCreateDbPoolRequired) {
      dbPoolCluster.createPool(poolName, schema)
    }
    if (callback) {
      return callback(error, result);
    }
  };

  dbPool.connect()
    .then(function (client) {
      var query = buildQuery(procedure, params, client);
      return client.query(query)
        .then(function (result) {
          client.release();
          postQueryProcessCallback(undefined, result, false);
        })
        .catch(function (queryError) {
          client.release();
          postQueryProcessCallback(queryError, undefined, false);
        })
    })
    .catch(function (connectionError) {
      postQueryProcessCallback(connectionError, undefined, true);
    });
};


module.exports = {read: executeRead, write: executeWrite};
