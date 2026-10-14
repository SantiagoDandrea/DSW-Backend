import { ApiError } from "../errors/ApiError.js";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // JSON mal formado en el cuerpo (lo detecta express.json)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la solicitud no es un JSON válido." });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor." });
}
