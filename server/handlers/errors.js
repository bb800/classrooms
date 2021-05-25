class ApplicationError extends Error {
  constructor(status, message, ...params) {
    super(...params);

    this.status = status;
    this.message = message;
    this.date = new Date();
  }
}

module.exports = { ApplicationError };
