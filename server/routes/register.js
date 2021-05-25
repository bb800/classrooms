const express = require('express');
const { ApplicationError } = require('../handlers/errors');
const { classroomRepository } = require('../db/repository');
require('express-async-errors');

const router = new express.Router();

router.post('/', async (req, res) => {
  const { teacher, students } = req.body;

  if (!teacher) {
    throw new ApplicationError(400, 'teacher key with email is required');
  }

  if (!students || !Array.isArray(students) || students.length < 1) {
    throw new ApplicationError(
      400,
      'student key with array of at least 1 student email is required'
    );
  }

  await classroomRepository.registerStudents(teacher, students);
  res.sendStatus(204);
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('error on /api/register');

  let errorMessage;
  let status = 400;
  const { errno } = err;

  if (err instanceof ApplicationError) {
    errorMessage = err.message;
    status = err.status;
  } else if (errno === 1062) {
    errorMessage =
      '1 or more students already registered! Please try again with unregistered students.';
  } else if (errno === 1048) {
    errorMessage =
      '1 or more teacher(s)/student(s) not found. Please check your input and try again.';
  } else {
    status = 500;
    errorMessage = 'Unknown error occured';
  }

  throw new ApplicationError(status, errorMessage);
});

module.exports = router;
