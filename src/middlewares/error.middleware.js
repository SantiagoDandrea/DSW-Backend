import { ApiError } from "../errors/ApiError.js";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor." });
}
