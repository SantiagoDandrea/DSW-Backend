import { ValidationError } from "../../errors/ValidationError.js";

export const ESTADOS_ENVIO_VALIDOS = [
  "PENDIENTE",
  "EN_PREPARACION",
  "EN_TRANSITO",
  "ENTREGADO",
  "CANCELADO",
];

function validarId(valor, nombreCampo) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(
      `El campo "${nombreCampo}" debe ser un número entero positivo.`
    );
  }

  return id;
}

export function validateIdEnvio(req, res, next) {
  try {
    req.params.id = validarId(req.params.id, "id del envío");
    next();
  } catch (err) {
    next(err);
  }
}

export function validateFiltrosEnvios(req, res, next) {
  try {
    const filtros = {};

    if (req.query.estado !== undefined) {
      const estado = String(req.query.estado).trim();
      if (!ESTADOS_ENVIO_VALIDOS.includes(estado)) {
        throw new ValidationError(
          `El estado "${estado}" es inválido. Estados permitidos: ${ESTADOS_ENVIO_VALIDOS.join(", ")}.`
        );
      }
      filtros.estado = estado;
    }

    if (req.query.pedidoId !== undefined) {
      filtros.pedidoId = validarId(req.query.pedidoId, "pedidoId");
    }

    req.filtros = filtros;
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarEnvio(req, res, next) {
  try {
    const { domicilioEntrega } = req.body || {};

    if (
      typeof domicilioEntrega !== "string" ||
      domicilioEntrega.trim().length === 0
    ) {
      throw new ValidationError(
        "El campo 'domicilioEntrega' es obligatorio y debe ser un texto no vacío."
      );
    }

    req.body = {
      domicilioEntrega: domicilioEntrega.trim(),
    };

    next();
  } catch (err) {
    next(err);
  }
}
