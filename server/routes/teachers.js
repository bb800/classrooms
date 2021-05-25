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

  await classroomRepository.enrollTeachers(handleTeachersError, teachers);
  res.status(200).json(message(`${teachers.length} teacher(s) inserted`));
});

router.get('/', async (_, res) => {
  const teachers = await classroomRepository.getTeachers(handleTeachersError);
  res.json(data(teachers));
});

// error handlers on /teachers
function handleTeachersError(error) {
  console.error('error on /teachers');

  let errorMessage;
  const { errno } = error;
  if (errno === 1062) {
    errorMessage =
      '1 or more teachers already enrolled in the system! Please try again with teachers not in the system';
  } else {
    errorMessage = 'Unknown error occured';
  }

  return new ApplicationError(400, errorMessage);
}

module.exports = router;
