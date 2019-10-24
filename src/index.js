var generateConfig = require('./db-config');
var mysqlConnection = require('./mysql/db-connection');
var postgresConnection = require('./postgres/db-connection');


var config = generateConfig();
var dbConnection = config.databaseEngine === 'postgres' ? postgresConnection : mysqlConnection;

var executeRead = function (procedure, params, consistent, callback) {
  return dbConnection.read(procedure, params, consistent, callback);
};

var executeWrite = function (procedure, params, consistent, callback) {
  return dbConnection.write(procedure, params, consistent, callback);
};

module.exports = {read: executeRead, write: executeWrite};

