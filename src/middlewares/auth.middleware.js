import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Token no provisto."));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.usuario = { dni: payload.dni, rol: payload.rol };
    next();
  } catch (err) {
    next(new UnauthorizedError("Token inválido o vencido."));
  }
}
