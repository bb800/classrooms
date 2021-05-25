const { getConnectionPool } = require('./configurations');

class Repository {
  constructor(connectionPool) {
    this.connectionPool = connectionPool;
  }

  runQueryOnPool(query) {
    return this.connectionPool.query(query);
  }

  async executeQuery(query, errorHandler) {
    try {
      const dbReply = await this.runQueryOnPool(query);

      return dbReply;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  close() {
    return this.connectionPool.end();
  }

  enrollStudents(errorHandler, students) {
    const values = students.map((student) => `("${student}")`).join();
    const insertQuery = `insert into students (email) values ${values}`;

    return this.executeQuery(insertQuery, errorHandler);
  }

  getStudents(errorHandler) {
    return this.executeQuery('select * from students', errorHandler);
  }

  enrollTeachers(errorHandler, teachers) {
    const values = teachers.map((teacher) => `("${teacher}")`).join();
    const insertQuery = `insert into teachers (email) values ${values}`;

    return this.executeQuery(insertQuery, errorHandler);
  }

  getTeachers(errorHandler) {
    return this.executeQuery('select * from teachers', errorHandler);
  }

  registerStudents(errorHandler, { teacher, students }) {
    const values = students
      .map(
        (student) => `(
            (select id from teachers where email = "${teacher}"),
            (select id FROM students where email = "${student}")
        )`
      )
      .join();
    const query = `insert into registrations(teacher_id, student_id) values ${values};`;

    return this.executeQuery(query, errorHandler);
  }
}

const classroomRepository = new Repository(getConnectionPool());

// function executeQueryOn(connection) {
//   return async function exec(query, errorHandler) {
//     let conn;
//     try {
//       conn = await connection.getConnection();
//       const dbReply = await conn.query(query);
//       conn.end();

//       return dbReply;
//     } catch (error) {
//       if (conn) conn.end();

//       throw errorHandler(error);
//     }
//   };
// }

// const connection = getConnectionPool();
// const repository = executeQueryOn(connection);

module.exports = {
  Repository,
  classroomRepository,
  // repository,
};
