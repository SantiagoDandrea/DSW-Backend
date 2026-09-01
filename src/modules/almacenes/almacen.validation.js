import { ValidationError } from "../../errors/ValidationError.js";

function validarDescripcion(descripcion) {
  if (typeof descripcion !== "string") {
    throw new ValidationError(
      "La descripción es obligatoria y debe ser un texto."
    );
  }

  const descripcionNormalizada = descripcion.trim();

  if (descripcionNormalizada.length === 0) {
    throw new ValidationError(
      "La descripción es obligatoria y no puede estar vacía."
    );
  }

  return descripcionNormalizada;
}

function validarDireccion(direccion) {
  if (typeof direccion !== "string") {
    throw new ValidationError(
      "La dirección es obligatoria y debe ser un texto."
    );
  }

  const direccionNormalizada = direccion.trim();

  if (direccionNormalizada.length === 0) {
    throw new ValidationError(
      "La dirección es obligatoria y no puede estar vacía."
    );
  }

  return direccionNormalizada;
}

export function validateCrearAlmacen(req, res, next) {
  try {
    req.body.descripcion = validarDescripcion(req.body.descripcion);
    req.body.direccion = validarDireccion(req.body.direccion);

    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarAlmacen(req, res, next) {
  try {
    req.body.descripcion = validarDescripcion(req.body.descripcion);
    req.body.direccion = validarDireccion(req.body.direccion);

    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdAlmacen(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(
      new ValidationError(
        "El id del almacén debe ser un número entero positivo."
      )
    );
  }

  req.params.id = id;
  next();
}