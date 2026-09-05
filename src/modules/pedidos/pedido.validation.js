import { ValidationError } from "../../errors/ValidationError.js";

export const ESTADOS_VALIDOS = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
  "ENVIADO",
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

function validarCantidad(valor, nombreCampo = "cantidad") {
  const cantidad = Number(valor);

  if (
    (typeof valor !== "number" && typeof valor !== "string") ||
    !Number.isInteger(cantidad) ||
    cantidad <= 0
  ) {
    throw new ValidationError(
      `El campo "${nombreCampo}" debe ser un número entero positivo mayor a 0.`
    );
  }

  return cantidad;
}

function validarFecha(valor, nombreCampo) {
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

export function validateCrearPedido(req, res, next) {
  try {
    const { productos, medioPagoId, envio, usuarioDni } = req.body || {};

    if (!Array.isArray(productos) || productos.length === 0) {
      throw new ValidationError(
        "El pedido debe contener al menos un producto en la lista 'productos'."
      );
    }

    const productosIds = new Set();
    const productosValidados = productos.map((item, index) => {
      if (!item || typeof item !== "object") {
        throw new ValidationError(
          `El elemento en la posición ${index} de 'productos' es inválido.`
        );
      }

      const productoId = validarId(
        item.productoId,
        `productos[${index}].productoId`
      );
      const cantidad = validarCantidad(
        item.cantidad,
        `productos[${index}].cantidad`
      );

      if (productosIds.has(productoId)) {
        throw new ValidationError(
          `No se permiten productos duplicados en el pedido (productoId: ${productoId}).`
        );
      }
      productosIds.add(productoId);

      return { productoId, cantidad };
    });

    const medioPagoIdValidado = validarId(medioPagoId, "medioPagoId");

    let envioValidado = { requiereEnvio: false };
    if (envio && typeof envio === "object") {
      const requiereEnvio = Boolean(envio.requiereEnvio);

      if (requiereEnvio) {
        if (
          typeof envio.domicilioEntrega !== "string" ||
          envio.domicilioEntrega.trim().length === 0
        ) {
          throw new ValidationError(
            "El campo 'domicilioEntrega' es obligatorio cuando 'requiereEnvio' es true."
          );
        }

        envioValidado = {
          requiereEnvio: true,
          domicilioEntrega: envio.domicilioEntrega.trim(),
        };
      }
    }

    const bodyLimpio = {
      productos: productosValidados,
      medioPagoId: medioPagoIdValidado,
      envio: envioValidado,
    };

    if (req.usuario?.rol === "ADMIN" && usuarioDni !== undefined) {
      if (typeof usuarioDni !== "string" || !/^\d{7,8}$/.test(usuarioDni)) {
        throw new ValidationError(
          "El DNI del usuario debe contener 7 u 8 dígitos numéricos."
        );
      }
      bodyLimpio.usuarioDni = usuarioDni;
    }

    req.body = bodyLimpio;
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdPedido(req, res, next) {
  try {
    req.params.id = validarId(req.params.id, "id del pedido");
    next();
  } catch (err) {
    next(err);
  }
}

export function validateFiltrosPedidos(req, res, next) {
  try {
    const filtros = {};

    if (req.query.estado !== undefined) {
      const estado = String(req.query.estado).trim();
      if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new ValidationError(
          `El estado "${estado}" es inválido. Estados permitidos: ${ESTADOS_VALIDOS.join(", ")}.`
        );
      }
      filtros.estado = estado;
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

    if (req.query.usuario !== undefined) {
      const usuario = String(req.query.usuario).trim();
      if (usuario.length > 0) {
        filtros.usuarioDni = usuario;
      }
    }

    req.filtros = filtros;
    next();
  } catch (err) {
    next(err);
  }
}

export function validateCambiarEstado(req, res, next) {
  try {
    const { estado } = req.body || {};

    if (typeof estado !== "string" || !ESTADOS_VALIDOS.includes(estado.trim())) {
      throw new ValidationError(
        `El campo 'estado' es obligatorio y debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}.`
      );
    }

    req.body = { estado: estado.trim() };
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarPedido(req, res, next) {
  try {
    const { medioPagoId, domicilioEntrega } = req.body || {};
    const bodyLimpio = {};

    if (medioPagoId !== undefined) {
      bodyLimpio.medioPagoId = validarId(medioPagoId, "medioPagoId");
    }

    if (domicilioEntrega !== undefined) {
      if (
        typeof domicilioEntrega !== "string" ||
        domicilioEntrega.trim().length === 0
      ) {
        throw new ValidationError(
          "El domicilio de entrega debe ser un texto no vacío."
        );
      }
      bodyLimpio.domicilioEntrega = domicilioEntrega.trim();
    }

    if (Object.keys(bodyLimpio).length === 0) {
      throw new ValidationError(
        "Debe proporcionar al menos un campo para actualizar (medioPagoId o domicilioEntrega)."
      );
    }

    req.body = bodyLimpio;
    next();
  } catch (err) {
    next(err);
  }
}
