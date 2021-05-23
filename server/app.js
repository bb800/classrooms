const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Setup routes
app.use('/', indexRouter);
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
