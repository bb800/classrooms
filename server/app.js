const express = require('express');
// const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { ApplicationError } = require('./db/errors');

// Routes
const teachersRouter = require('./routes/teachers');
const studentsRouter = require('./routes/students');
const registerRouter = require('./routes/register');
const commonStudentsRouter = require('./routes/commonStudents');
const suspendRouter = require('./routes/suspend');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    throw new ApplicationError(400, 'Invalid Json');
  } else {
    next();
  }
});

// Setup routes
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/register', registerRouter);
app.use('/api/commonStudents', commonStudentsRouter);
app.use('/api/suspend', suspendRouter);

// Catch all route
// eslint-disable-next-line no-unused-vars
app.use('*', (req, res) => {
  throw new ApplicationError(400, 'Unsupported api');
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { status, message } = err;
  console.error('error: ', message);

  res.status(status).json({
    error: {
      code: status,
      message,
    },
  });
});

module.exports = app;
