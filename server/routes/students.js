const express = require('express');
require('express-async-errors');
const executeQuery = require('../db/query');
const { ApplicationError } = require('../handlers/errors');
const { data, message } = require('../handlers/data');

const router = new express.Router();

router.put('/', async (req, res) => {
  const students = req.body;
  if (students === undefined || !Array.isArray(students)) {
    throw new ApplicationError(
      400,
      'At least 1 student email should be supplied as a json array in request body'
    );
  }

  const values = students.map((student) => `("${student}")`).join();
  const insertQuery = `insert into students (email) values ${values};`;

  await executeQuery(insertQuery, handleStudentError);
  res.status(200).json(message(`${students.length} student(s) inserted`));
});

router.get('/', async (req, res) => {
  const students = await executeQuery(
    'select * from students',
    handleStudentError
  );
  res.json(data(students));
});

// error handlers on /student
function handleStudentError(error) {
  console.error('error on /register');

  let errorMessage;
  const { errno } = error;
  if (errno === 1062) {
    errorMessage =
      '1 or more students already in the system! Please try again with students not in the system';
  } else {
    errorMessage = 'Unknown error occured';
  }

  return new ApplicationError(400, errorMessage);
}

module.exports = router;
