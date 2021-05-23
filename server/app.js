const express = require('express');
// const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Routes
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Setup routes
app.use('/users', usersRouter);

// Catch all route
app.get('*', (req, res) => {
  res.status(400).json({
    error: {
      code: 400,
      message: "you shouldn't be here",
    },
  });
});

module.exports = app;
