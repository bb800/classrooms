const executeQuery = require('./query');
const { ApplicationError } = require('../handlers/errors');

async function registerStudents({ teacher, students }, errorHandler) {
  if (!teacher) {
    throw new ApplicationError(400, 'teacher key with email is required');
  } else if (!students || !Array.isArray(students) || students.length < 1) {
    throw new ApplicationError(
      400,
      'student key with array of at least 1 student email is required!'
    );
  }

  const values = students
    .map(
      (student) => `(
            (select id from teachers where email = "${teacher}"),
            (select id FROM students where email = "${student}")
        )`
    )
    .join();
  const query = `insert into registrations(teacher_id, student_id) values ${values};`;

  return executeQuery(query, errorHandler);
}

module.exports = registerStudents;
