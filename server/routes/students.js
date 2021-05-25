const express = require('express');
require('express-async-errors');
const { classroomRepository } = require('../db/repository');
const { ApplicationError } = require('../db/errors');
const { data, message } = require('../utils/data');

const router = new express.Router();

router.put('/', async (req, res) => {
  const students = req.body;

  if (
    students === undefined ||
    !Array.isArray(students) ||
    students.length === 0
  ) {
    throw new ApplicationError(
      400,
      'At least 1 student email should be supplied as a json array in request body'
    );
  }

  await classroomRepository.enrollStudents(students);

  res.status(200).json(message(`${students.length} student(s) inserted`));
});

router.get('/', async (req, res) => {
  const students = await classroomRepository.getStudents();
  res.json(data(students));
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('error on /api/students');

  let errorMessage;
  let status = 400;
  const { errno } = err;

  if (err instanceof ApplicationError) {
    errorMessage = err.message;
    status = err.status;
  } else if (errno === 1062) {
    errorMessage =
      '1 or more students already enrolled in the system! Please try again with students not in the system';
  } else {
    status = 500;
    errorMessage = 'Unknown error occured';
  }

  throw new ApplicationError(status, errorMessage);
});

module.exports = router;
