class ApplicationError extends Error {
  constructor(status, message, ...params) {
    super(...params);

    this.status = status;
    this.message = message;
    this.date = new Date();
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { status, message } = err;
  console.error('error: ', message);

  res.status(status).json({
    error: {
      code: status,
      message,
    },
  });
};

module.exports = { ApplicationError, errorHandler };
