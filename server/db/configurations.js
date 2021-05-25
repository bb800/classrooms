const mariadb = require('mariadb');

const getConnectionPool = () =>
  mariadb.createPool({
    host: 'localhost',
    database: 'classroom',
    user: 'teacher_app',
    password: 'pass',
    connectionLimit: 5,
  });

const getTestConnectionPool = () =>
  mariadb.createPool({
    host: 'localhost',
    database: 'test_classroom',
    user: 'test',
    password: 'pass',
    connectionLimit: 5,
  });

module.exports = {
  getConnectionPool,
  getTestConnectionPool,
};
