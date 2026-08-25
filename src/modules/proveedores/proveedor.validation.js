import { ValidationError } from "../../errors/ValidationError.js";

const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/;

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

function validarCuit(cuit) {
  if (typeof cuit !== "string") {
    throw new ValidationError("El CUIT es obligatorio y debe ser un texto.");
  }

  const cuitNormalizado = cuit.trim();

  if (cuitNormalizado.length === 0) {
    throw new ValidationError("El CUIT es obligatorio y no puede estar vacío.");
  }

  if (!CUIT_REGEX.test(cuitNormalizado)) {
    throw new ValidationError("El CUIT ingresado no es válido.");
  }

  return cuitNormalizado;
}

function validarTelefono(telefono) {
  if (typeof telefono !== "string") {
    throw new ValidationError("El teléfono es obligatorio y debe ser un texto.");
  }

  const telefonoNormalizado = telefono.trim();

  if (telefonoNormalizado.length === 0) {
    throw new ValidationError("El teléfono es obligatorio y no puede estar vacío.");
  }

  return telefonoNormalizado;
}

export function validateCrearProveedor(req, res, next) {
  try {
    req.body.nombre = validarNombre(req.body.nombre);
    req.body.cuit = validarCuit(req.body.cuit);
    req.body.telefono = validarTelefono(req.body.telefono);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarProveedor(req, res, next) {
  try {
    req.body.nombre = validarNombre(req.body.nombre);
    req.body.cuit = validarCuit(req.body.cuit);
    req.body.telefono = validarTelefono(req.body.telefono);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdProveedor(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(new ValidationError("El id del proveedor debe ser un número entero positivo."));
  }

  req.params.id = id;
  next();
}
