const express = require('express');
require('express-async-errors');

const { ApplicationError } = require('../handlers/errors');
const registerStudents = require('../db/registerStudents');

const router = new express.Router();

router.post('/', async (req, res) => {
  const { teacher, students } = req.body;
  console.log('teachers:', teacher);
  console.log('students:', students);

  if (!teacher) {
    throw new ApplicationError(400, 'teacher key with email is required');
  } else if (!students || !Array.isArray(students) || students.length < 1) {
    throw new ApplicationError(
      400,
      'student key with array of at least 1 student email is required!'
    );
  }

  await registerStudents({ teacher, students }, handleDuplicateStudent);
  res.sendStatus(204);
});

function handleDuplicateStudent(error) {
  console.error('error on /register');

  let message;
  const { errno } = error;
  if (errno === 1062) {
    message =
      '1 or more students already registered! Please try again with unregistered students.';
  } else if (errno === 1048) {
    message =
      'Teacher and/or 1 or more student(s) not found. Please check your input and try again.';
  } else {
    message = 'Unknown registration error occured';
  }

  return new ApplicationError(400, message);
}

module.exports = router;
