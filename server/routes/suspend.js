const express = require('express');
require('express-async-errors');
const { classroomRepository } = require('../db/repository');
const { ApplicationError } = require('../db/errors');

const router = new express.Router();

router.post('/', async (req, res) => {
  const { student } = req.body;

  if (student === undefined || typeof student !== 'string') {
    throw new ApplicationError(
      400,
      'Student email must be supplied in request body'
    );
  }

  await classroomRepository.suspendStudent(student);

  res.sendStatus(204);
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('error on /api/suspend');

  let errorMessage;
  let status = 400;
  const { errno } = err;

  if (err instanceof ApplicationError) {
    errorMessage = err.message;
    status = err.status;
  } else if (errno) {
    errorMessage = 'Unknown error occured';
    status = 500;
  }

  throw new ApplicationError(status, errorMessage);
});

module.exports = router;
