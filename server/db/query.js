const mariadb = require('mariadb');

const connectionPool = mariadb.createPool({
  host: 'localhost',
  database: 'classroom',
  user: 'teacher_app',
  password: 'pass',
  connectionLimit: 5,
});

async function executeQuery(query, errorHandler) {
  let conn;
  try {
    conn = await connectionPool.getConnection();
    const dbReply = await conn.query(query);
    conn.end();

    return dbReply;
  } catch (error) {
    if (conn) conn.end();

    throw errorHandler(error);
  }
}

module.exports = executeQuery;
