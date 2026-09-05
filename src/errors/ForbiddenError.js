import { ApiError } from "./ApiError.js";

export class ForbiddenError extends ApiError {
  constructor(message = "Acceso no autorizado a este recurso.") {
    super(message, 403);
  }
}
