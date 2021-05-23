const express = require('express');
require('express-async-errors');
const connectionPool = require('../db/connectionPool');
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

  let conn;
  try {
    // eslint-disable-next-line prefer-template
    const values = students.map((student) => `("${student}")`).join() + ';';

    const insertQuery = `insert into students (email) values ${values}`;
    console.log('query to db:', insertQuery);

    conn = await connectionPool.getConnection();
    const dbReply = await conn.query(insertQuery);
    console.log('dbReply: ', dbReply);

    // TODO: Move into data handler
    res.status(200).json(message(`${students.length} student(s) inserted`));
  } catch (error) {
    handleStudentError(error);
  } finally {
    if (conn) conn.end();
  }
});

router.get('/', async (_, res) => {
  let conn;
  try {
    conn = await connectionPool.getConnection();
    const students = await conn.query('select * from students');

    res.json(data(students));
  } catch (error) {
    handleStudentError(error);
  } finally {
    if (conn) conn.end();
  }
});

function handleStudentError(error) {
  console.error('error on /student:', error);
  throw new ApplicationError(400, 'server error occured');
}

module.exports = router;
