const express = require('express');
require('express-async-errors');
const { classroomRepository } = require('../db/repository');
const { ApplicationError, DataError } = require('../db/errors');

const router = new express.Router();

router.post('/', async (req, res) => {
  const { teacher, notification } = req.body;

  if (teacher === undefined || typeof teacher !== 'string') {
    throw new ApplicationError(
      400,
      'teacher email string must be supplied in request body'
    );
  }

  if (notification === undefined || typeof notification !== 'string') {
    throw new ApplicationError(
      400,
      'notification string must be supplied in request body'
    );
  }

  const students = notification
    // find potential @'s
    .split(' @')
    // trim everything after the space
    .map((s) => s.split(' ')[0])
    // retain only email addresses
    .filter((s) => s.includes('@'));

  const result = await classroomRepository.retrieveForNotifications(
    teacher,
    students
  );

  res.status(200).json({
    recipients: result,
  });
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('error on /api/retrievefornotifications');

  let errorMessage;
  let status;
  const { errno } = err;

  if (err instanceof ApplicationError || err instanceof DataError) {
    errorMessage = err.message;
    status = err.status;
  } else if (errno) {
    errorMessage = 'Unknown error occured';
    status = 500;
    console.error('Database error: ', errno);
  } else {
    status = 500;
    errorMessage = 'Unknown error occured';
    console.error(errorMessage);
  }

  throw new ApplicationError(status, errorMessage);
});

module.exports = router;
