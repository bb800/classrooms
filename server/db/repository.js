const { getConnectionPool } = require('./configurations');
const { DataError } = require('./errors');

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
      throw new DataError(
        400,
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

  suspendStudent(student) {
    const query = `update students set suspended = true where email = '${student}'`;

    return this.executePoolQuery(query);
  }

  async getStudentRecords(students) {
    const whereClause = students
      .map((studentEmail) => `email = '${studentEmail}'`)
      .join(' or ');
    const query = `select email, suspended
    from students
    where ${whereClause}`;

    const mentionedStudents = await this.executePoolQuery(query);

    return mentionedStudents;
  }

  async checkTeacherEnrolled(teacher) {
    const query = `select * from teachers where email = '${teacher}'`;

    const results = await this.executePoolQuery(query);

    if (results.length === 0) {
      throw new DataError(400, `Teacher '${teacher}' has not been enrolled`);
    }
  }

  async retrieveForNotifications(teacher, mentionedStudents) {
    await this.checkTeacherEnrolled(teacher);

    const studentsRegisteredToTeacher = await this.getCommonStudents([teacher]);

    // combine mentioned students and student registered to teacher
    const studentSet = new Set();
    mentionedStudents.forEach((s) => studentSet.add(s));
    studentsRegisteredToTeacher.forEach((s) => studentSet.add(s));

    const studentArray = [];
    studentSet.forEach((s) => studentArray.push(s));

    // get records for students and filter out suspended students
    const studentRecords = await this.getStudentRecords(studentArray);
    const nonSuspendedStudents = studentRecords
      .filter((r) => r.suspended === 0)
      .map((r) => r.email);

    return nonSuspendedStudents;
  }
}

const classroomRepository = new Repository(getConnectionPool());

module.exports = {
  Repository,
  classroomRepository,
};
