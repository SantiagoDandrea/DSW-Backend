import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

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

export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new UnauthorizedError("Token no provisto."));
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        new ForbiddenError("No tienes permisos para realizar esta acción.")
      );
    }

    next();
  };
}
