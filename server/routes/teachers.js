const express = require('express');
require('express-async-errors');
const executeQuery = require('../db/query');
const { ApplicationError } = require('../handlers/errors');
const { data, message } = require('../handlers/data');

const router = new express.Router();

router.put('/', async (req, res) => {
  const teachers = req.body;
  if (teachers === undefined || !Array.isArray(teachers)) {
    throw new ApplicationError(
      400,
      'At least 1 teacher email should be supplied as a json array in request body'
    );
  }

  const values = teachers.map((teacher) => `("${teacher}")`).join();
  const insertQuery = `insert into teachers (email) values ${values};`;

  await executeQuery(insertQuery, handleTeachersError);
  res.status(200).json(message(`${teachers.length} teacher(s) inserted`));
});

router.get('/', async (_, res) => {
  const teachers = await executeQuery(
    'select * from teachers',
    handleTeachersError
  );
  res.json(data(teachers));
});

// error handlers on /teachers
function handleTeachersError(error) {
  console.error('error on /teachers');

  let errorMessage;
  const { errno } = error;
  if (errno === 1062) {
    errorMessage =
      '1 or more teachers already in the system! Please try again with teachers not in the system';
  } else {
    errorMessage = 'Unknown error occured';
  }

  return new ApplicationError(400, errorMessage);
}

module.exports = router;
