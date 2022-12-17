import { ERRORS } from "../consts/index.js";

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = ERRORS.VALIDATION_ERROR;
  }
}
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = ERRORS.NOT_FOUND;
  }
}
