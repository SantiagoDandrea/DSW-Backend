import { ValidationError } from "../../errors/ValidationError.js";

function validarIdReferencia(valor, nombreCampo) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(
      `El campo "${nombreCampo}" debe ser un número entero positivo.`
    );
  }

  return id;
}

function validarCantidad(cantidad) {
  const valor = Number(cantidad);

  if (
    (typeof cantidad !== "number" && typeof cantidad !== "string") ||
    !Number.isInteger(valor) ||
    valor < 0
  ) {
    throw new ValidationError(
      "La cantidad debe ser un número entero mayor o igual a 0."
    );
  }

  return valor;
}

function validarDatosStock(body) {
  const productoId = validarIdReferencia(body.productoId, "productoId");
  const almacenId = validarIdReferencia(body.almacenId, "almacenId");
  const cantidad = validarCantidad(body.cantidad);

  return {
    productoId,
    almacenId,
    cantidad,
  };
}

export function validateCrearStock(req, res, next) {
  try {
    req.body = validarDatosStock(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarStock(req, res, next) {
  try {
    req.body = validarDatosStock(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdStock(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(
      new ValidationError(
        "El id del stock debe ser un número entero positivo."
      )
    );
  }

  req.params.id = id;
  next();
}

export function validateFiltrosStock(req, res, next) {
  try {
    const filtros = {};

    if (req.query.productoId !== undefined) {
      filtros.productoId = validarIdReferencia(
        req.query.productoId,
        "productoId"
      );
    }

    if (req.query.almacenId !== undefined) {
      filtros.almacenId = validarIdReferencia(
        req.query.almacenId,
        "almacenId"
      );
    }

    req.filtros = filtros;
    next();
  } catch (err) {
    next(err);
  }
}
