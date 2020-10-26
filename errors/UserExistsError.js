class UserExistsError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.statusCode = 409;
  }
}

module.exports = UserExistsError;
