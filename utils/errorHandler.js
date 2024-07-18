export class errorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, errorHandler);
  }

  static createError(message, statusCode) {
    return new errorHandler(message, statusCode);
  }
}
