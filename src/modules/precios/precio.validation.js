import { ValidationError } from "../../errors/ValidationError.js";
import { validarMontoMonetario } from "../../utils/validation.utils.js";

function validarId(valor, nombreCampo) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(
      `El campo "${nombreCampo}" debe ser un número entero positivo.`
    );
  }

  return id;
}

function validarValor(valor) {
  return validarMontoMonetario(valor, "El valor", { permitirCero: false });
}

function validarFecha(valor, nombreCampo = "fechaDesde") {
  if (
    (typeof valor !== "string" && typeof valor !== "number") ||
    String(valor).trim().length === 0
  ) {
    throw new ValidationError(
      `El campo "${nombreCampo}" debe ser una fecha válida.`
    );
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    throw new ValidationError(
      `El campo "${nombreCampo}" debe ser una fecha válida.`
    );
  }

  return fecha;
}

function validarDatosPrecio(body = {}) {
  return {
    productoId: validarId(body.productoId, "productoId"),
    valor: validarValor(body.valor),
    fechaDesde: validarFecha(body.fechaDesde),
  };
}

export function validateCrearPrecio(req, res, next) {
  try {
    req.body = validarDatosPrecio(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarPrecio(req, res, next) {
  try {
    req.body = validarDatosPrecio(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdPrecio(req, res, next) {
  try {
    req.params.id = validarId(req.params.id, "id del precio");
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdProductoPrecio(req, res, next) {
  try {
    req.params.id = validarId(req.params.id, "id del producto");
    next();
  } catch (err) {
    next(err);
  }
}

export function validateFiltrosPrecio(req, res, next) {
  try {
    const filtros = {};

    if (req.query.productoId !== undefined) {
      filtros.productoId = validarId(req.query.productoId, "productoId");
    }

    if (req.query.fechaDesde !== undefined) {
      filtros.fechaDesde = validarFecha(req.query.fechaDesde, "fechaDesde");
    }

    if (req.query.fechaHasta !== undefined) {
      filtros.fechaHasta = validarFecha(req.query.fechaHasta, "fechaHasta");
    }

    if (
      filtros.fechaDesde !== undefined &&
      filtros.fechaHasta !== undefined &&
      filtros.fechaDesde > filtros.fechaHasta
    ) {
      throw new ValidationError(
        "El filtro fechaDesde no puede ser posterior a fechaHasta."
      );
    }

    req.filtros = filtros;
    next();
  } catch (err) {
    next(err);
  }
}
