import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { usuarioRepository } from "../modules/usuarios/usuario.repository.js";

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Token no provisto."));
  }

  const token = authHeader.slice("Bearer ".length);

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    return next(new UnauthorizedError("Token inválido o vencido."));
  }

  try {
    // El token prueba quién es; si sigue activo y su rol actual se consultan en la base
    const usuario = await usuarioRepository.obtenerUsuarioPorDni(payload.dni);

    if (!usuario || !usuario.activo) {
      return next(new UnauthorizedError("El usuario no existe o se encuentra inactivo."));
    }

    req.usuario = { dni: usuario.dni, rol: usuario.rol };
    next();
  } catch (err) {
    next(err);
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
