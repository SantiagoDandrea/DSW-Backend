import { ValidationError } from "../../errors/ValidationError.js";

function validarTexto(valor, nombreCampo) {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new ValidationError(`El campo "${nombreCampo}" es obligatorio y debe ser un texto.`);
  }
  return valor.trim();
}

function validarIdRelacion(valor, nombreCampo) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`El campo "${nombreCampo}" debe ser un número entero positivo.`);
  }
  return id;
}

function validarProducto(body) {
  return {
    nombre: validarTexto(body.nombre, "nombre"),
    descripcion: validarTexto(body.descripcion, "descripcion"),
    categoriaId: validarIdRelacion(body.categoriaId, "categoriaId"),
    marcaId: validarIdRelacion(body.marcaId, "marcaId"),
    proveedorId: validarIdRelacion(body.proveedorId, "proveedorId"),
  };
}

export function validateCrearProducto(req, res, next) {
  try {
    req.body = validarProducto(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarProducto(req, res, next) {
  try {
    req.body = validarProducto(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdProducto(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new ValidationError("El id del producto debe ser un número entero positivo."));
  }
  req.params.id = id;
  next();
}