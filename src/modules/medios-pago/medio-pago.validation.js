import { ValidationError } from "../../errors/ValidationError.js";

function validarDescripcion(descripcion) {
  if (typeof descripcion !== "string") {
    throw new ValidationError("La descripción es obligatoria y debe ser un texto.");
  }

  const descripcionNormalizada = descripcion.trim();

  if (descripcionNormalizada.length === 0) {
    throw new ValidationError("La descripción es obligatoria y no puede estar vacía.");
  }

  return descripcionNormalizada;
}

export function validateCrearMedioPago(req, res, next) {
  try {
    req.body.descripcion = validarDescripcion(req.body.descripcion);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarMedioPago(req, res, next) {
  try {
    req.body.descripcion = validarDescripcion(req.body.descripcion);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdMedioPago(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(new ValidationError("El id del medio de pago debe ser un número entero positivo."));
  }

  req.params.id = id;
  next();
}
