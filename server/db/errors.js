/* eslint-disable max-classes-per-file */
class ApplicationError extends Error {
  constructor(status, message, ...params) {
    super(...params);

    this.status = status;
    this.message = message;
    this.date = new Date();
  }
}

class DataError extends Error {
  constructor(status, message, ...params) {
    super(...params);

    this.status = status;
    this.message = message;
    this.date = new Date();
  }
}

module.exports = { ApplicationError, DataError };
