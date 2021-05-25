const { getConnectionPool } = require('./configurations');

class Repository {
  constructor(connectionPool) {
    this.connectionPool = connectionPool;
  }

  // Convenience function for tests
  executePoolQuery(query) {
    return this.connectionPool.query(query);
  }

  close() {
    return this.connectionPool.end();
  }

  enrollStudents(students) {
    const values = students.map((student) => `("${student}")`).join();
    const insertQuery = `insert into students (email) values ${values}`;

    return this.connectionPool.query(insertQuery);
  }

  getStudents() {
    return this.connectionPool.query('select * from students');
  }

  enrollTeachers(teachers) {
    const values = teachers.map((teacher) => `("${teacher}")`).join();
    const insertQuery = `insert into teachers (email) values ${values}`;

    return this.executePoolQuery(insertQuery);
  }

  getTeachers() {
    return this.executePoolQuery('select * from teachers');
  }

  registerStudents(teacher, students) {
    const values = students
      .map(
        (student) => `(
            (select id from teachers where email = "${teacher}"),
            (select id FROM students where email = "${student}")
        )`
      )
      .join();
    const query = `insert into registrations(teacher_id, student_id) values ${values};`;

    return this.executePoolQuery(query);
  }

  async getRegistrationsWhereTeacher(teacher) {
    const registrationJoinQuery = `select registrations.id as id, teachers.email as teacher_email, students.email as student_email, students.suspended as student_suspended
      from registrations
      inner join teachers on registrations.teacher_id = teachers.id
      inner join students on registrations.student_id = students.id
      where teachers.email = "${teacher}"`;

    const result = await this.executePoolQuery(registrationJoinQuery);

    if (result.length === 0) {
      throw new Error(
        `Teacher '${teacher}' does not have any registered students`
      );
    }

    return result;
  }

  async getCommonStudents(teachers) {
    const classes = await Promise.all(
      teachers.map((teacher) => this.getRegistrationsWhereTeacher(teacher))
    );

    const studentTeacherMap = classes.reduce((acc, registrations) => {
      registrations.forEach((r) => {
        const teacherEmail = r.teacher_email;
        const studentEmail = r.student_email;

        if (acc[studentEmail] === undefined) {
          acc[studentEmail] = [teacherEmail];
        } else {
          acc[studentEmail].push(teacherEmail);
        }
      });

      return acc;
    }, {});

    const commonStudents = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [studentEmail, teacherList] of Object.entries(
      studentTeacherMap
    )) {
      if (teacherList.length === teachers.length)
        commonStudents.push(studentEmail);
    }

    return commonStudents;
  }
}

const classroomRepository = new Repository(getConnectionPool());

module.exports = {
  Repository,
  classroomRepository,
};
