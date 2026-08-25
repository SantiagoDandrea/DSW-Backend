import { ApiError } from "./ApiError.js";

export class ConflictError extends ApiError {
  constructor(message = "Conflicto con el estado actual del recurso.") {
    super(message, 409);
  }
}
