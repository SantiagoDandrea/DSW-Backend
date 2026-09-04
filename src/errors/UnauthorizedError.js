import { ApiError } from "./ApiError.js";

export class UnauthorizedError extends ApiError {
  constructor(message = "No autorizado.") {
    super(message, 401);
  }
}
