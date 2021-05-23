const mariadb = require('mariadb');

const connectionPool = mariadb.createPool({
  host: 'localhost',
  database: 'classroom',
  user: 'teacher_app',
  password: 'pass',
  connectionLimit: 5,
});

module.exports = connectionPool;
