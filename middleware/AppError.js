/**
 * An error that carries the HTTP status code it should be sent with.
 * The global error middleware uses `statusCode` to build the response.
 */
export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
