const express = require('express');
const { ApplicationError } = require('../handlers/errors');
const { classroomRepository } = require('../db/repository');
require('express-async-errors');

const router = new express.Router();

router.get('/', async (req, res) => {
  const { teacher } = req.query;

  console.log('teacher:', teacher);
  console.log('query:', req.url);

  if (!teacher) {
    throw new ApplicationError(
      400,
      'At least 1 teacher query param is required'
    );
  }

  let teachers;
  if (Array.isArray(teacher)) {
    teachers = teacher;
  } else {
    teachers = [teacher];
  }

  const result = await classroomRepository.getCommonStudents(teachers);

  res.status(200).json({
    students: result,
  });
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.error('error on /api/commonStudents');

  let errorMessage;
  let status;
  const { errno } = err;

  if (errno) {
    status = 500;
    errorMessage = 'Unknown error occured';
  } else {
    status = 400;
    errorMessage = err.message;
  }

  throw new ApplicationError(status, errorMessage);
});

module.exports = router;
