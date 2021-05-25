const express = require('express');
require('express-async-errors');
const { classroomRepository } = require('../db/repository');
const { ApplicationError } = require('../handlers/errors');
const { data, message } = require('../handlers/data');

const router = new express.Router();

router.put('/', async (req, res) => {
  const teachers = req.body;

  if (
    teachers === undefined ||
    !Array.isArray(teachers) ||
    teachers.length === 0
  ) {
    throw new ApplicationError(
      400,
      'At least 1 teacher email should be supplied as a json array in request body'
    );
  }

  await classroomRepository.enrollTeachers(teachers);
  res.status(200).json(message(`${teachers.length} teacher(s) inserted`));
});

router.get('/', async (_, res) => {
  const teachers = await classroomRepository.getTeachers();
  res.json(data(teachers));
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('error on /api/teachers');

  let errorMessage;
  let status = 400;
  const { errno } = err;

  if (err instanceof ApplicationError) {
    errorMessage = err.message;
    status = err.status;
  } else if (errno === 1062) {
    errorMessage =
      '1 or more teachers already enrolled in the system! Please try again with teachers not in the system';
  } else {
    status = 500;
    errorMessage = 'Unknown error occured';
  }

  throw new ApplicationError(status, errorMessage);
});

module.exports = router;
