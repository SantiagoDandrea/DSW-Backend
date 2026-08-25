import { ApiError } from "./ApiError.js";

export class ValidationError extends ApiError {
  constructor(message = "Datos inválidos.") {
    super(message, 400);
  }
}
