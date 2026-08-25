import { ValidationError } from "../../errors/ValidationError.js";

function validarNombre(nombre) {
  if (typeof nombre !== "string") {
    throw new ValidationError("El nombre es obligatorio y debe ser un texto.");
  }

  const nombreNormalizado = nombre.trim();

  if (nombreNormalizado.length === 0) {
    throw new ValidationError("El nombre es obligatorio y no puede estar vacío.");
  }

  return nombreNormalizado;
}

export function validateCrearCategoria(req, res, next) {
  try {
    req.body.nombre = validarNombre(req.body.nombre);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarCategoria(req, res, next) {
  try {
    req.body.nombre = validarNombre(req.body.nombre);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdCategoria(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(new ValidationError("El id de la categoría debe ser un número entero positivo."));
  }

  req.params.id = id;
  next();
}
