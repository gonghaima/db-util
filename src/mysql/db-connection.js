var mysql = require('mysql');
var generateConfig = require('../db-config');


var readPoolName = 'READ_POOL';
var writePoolName = 'WRITE_POOL';
var config = generateConfig();
var dbClusterName = config.masterConfig.database;
var refDataConfigProvided = config && config.refDataConfig && config.refDataConfig.host;

var initConnection = function () {
  if (!global[dbClusterName]) {
    var poolCluster = mysql.createPoolCluster(config.clusterConfig);

    if (refDataConfigProvided) {
      poolCluster.add(readPoolName, config.refDataConfig);
    }
    else {
      poolCluster.add(readPoolName, config.slave1Config);
    }
    poolCluster.add(writePoolName, config.masterConfig);

    global[dbClusterName] = poolCluster;
  };
};

var format_command = function (procedure, params, connection) {
  var p = Array(params.length + 1).join('?,');
  p = p.substr(0, p.length - 1) //.split().join(',');
  return "CALL sp_" + procedure + connection.escape("(" + p + ")");
};

var getPoolCluster = function () {
  return global[dbClusterName];
};

var executeQuery = function (procedure, params, consistent, callback, pool) {
  initConnection();
  getPoolCluster().getConnection(pool, function (connectionError, connection) {
    if (connectionError) {
      createPoolIfNotExist(connectionError);
      if (connection) {
        connection.release();
      }
      if (callback) {
        return callback(connectionError, null);
      }
    }
    var command = format_command(procedure, params, connection);
    connection.query(command, params, function (err, rows) {

      connection.release();
      if (callback) {
        return callback(err, (err ? null : rows));
      }
    });
  });
};

var executeRead = function (procedure, params, consistent, callback) {
  return executeQuery(procedure, params, consistent, callback, readPoolName);
};

var executeWrite = function (procedure, params, consistent, callback) {
  return executeQuery(procedure, params, consistent, callback, writePoolName);
};

var createPoolIfNotExist = function (err) {
  if (err.code === 'POOL_NOEXIST') {
    var poolCluster = mysql.createPoolCluster(config.clusterConfig);
    if (refDataConfigProvided) {
      poolCluster.add(readPoolName, config.refDataConfig);
    }
    else {
      poolCluster.add(readPoolName, config.slave1Config);
    }
    poolCluster.add(writePoolName, config.masterConfig);

    global[dbClusterName] = poolCluster;
  }
};


module.exports = {read: executeRead, write: executeWrite};

