const express = require('express');
require('express-async-errors');
const connectionPool = require('../db/connectionPool');
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

  let conn;
  try {
    // eslint-disable-next-line prefer-template
    const values = teachers.map((teacher) => `("${teacher}")`).join() + ';';

    const insertQuery = `insert into teachers (email) values ${values}`;
    console.log('query to db:', insertQuery);

    conn = await connectionPool.getConnection();
    const dbReply = await conn.query(insertQuery);
    console.log('dbReply: ', dbReply);

    // TODO: Move into data handler
    res.status(200).json(message(`${teachers.length} teacher(s) inserted`));
  } catch (error) {
    handleteacherError(error);
  } finally {
    if (conn) conn.end();
  }
});

router.get('/', async (_, res) => {
  let conn;
  try {
    conn = await connectionPool.getConnection();
    const teachers = await conn.query('select * from teachers');

    res.json(data(teachers));
  } catch (error) {
    handleteacherError(error);
  } finally {
    if (conn) conn.end();
  }
});

function handleteacherError(error) {
  console.error('error on /teacher:', error);
  throw new ApplicationError(400, 'server error occured');
}

module.exports = router;
