import { envioRepository } from "./envio.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export const TARIFAS_ENVIO = {
  LOCAL: 3000,
  NACIONAL: 15000,
  CIUDAD_LOCAL: "las parejas",
};

const ESTADOS_CANCELABLES_ENVIO = ["PENDIENTE", "EN_PREPARACION"];
const ESTADOS_PEDIDO_PERMITEN_CANCELAR_ENVIO = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
];

export const envioService = {
  calcularCosto(localidadNombre) {
    if (!localidadNombre || typeof localidadNombre !== "string") {
      return TARIFAS_ENVIO.NACIONAL;
    }

    const normalizada = localidadNombre.trim().toLowerCase();
    if (normalizada === TARIFAS_ENVIO.CIUDAD_LOCAL) {
      return TARIFAS_ENVIO.LOCAL;
    }

    return TARIFAS_ENVIO.NACIONAL;
  },

  mapearEstadoPedidoAEnvio(nuevoEstadoPedido, estadoActualEnvio) {
    // Si el envío ya fue cancelado de forma independiente, permanece CANCELADO
    if (estadoActualEnvio === "CANCELADO") {
      return "CANCELADO";
    }

    switch (nuevoEstadoPedido) {
      case "PENDIENTE":
      case "CONFIRMADO":
      case "EN_PREPARACION":
        return "PENDIENTE";
      case "ENVIADO":
        return "EN_TRANSITO";
      case "ENTREGADO":
        return "ENTREGADO";
      case "CANCELADO":
        return "CANCELADO";
      default:
        return null;
    }
  },

  async obtenerEnvios(filtros = {}, usuarioAuth) {
    const where = {};

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.pedidoId) {
      where.pedidoId = filtros.pedidoId;
    }

    // Si es CLIENTE, solo puede ver envíos asociados a sus propios pedidos
    if (usuarioAuth.rol !== "ADMIN") {
      where.pedido = {
        usuarioDni: usuarioAuth.dni,
      };
    }

    return envioRepository.obtenerEnvios(where);
  },

  async obtenerEnvioPorId(id, usuarioAuth) {
    const envio = await envioRepository.obtenerEnvioPorId(id);

    if (!envio) {
      throw new NotFoundError(`No existe un envío con id ${id}.`);
    }

    if (
      usuarioAuth.rol !== "ADMIN" &&
      envio.pedido?.usuarioDni !== usuarioAuth.dni
    ) {
      throw new ForbiddenError(
        "No tienes permisos para consultar el detalle de este envío."
      );
    }

    return envio;
  },

  async actualizarEnvio(id, data, usuarioAuth) {
    const envio = await envioRepository.obtenerEnvioPorId(id);

    if (!envio) {
      throw new NotFoundError(`No existe un envío con id ${id}.`);
    }

    if (
      usuarioAuth.rol !== "ADMIN" &&
      envio.pedido?.usuarioDni !== usuarioAuth.dni
    ) {
      throw new ForbiddenError(
        "No tienes permisos para modificar este envío."
      );
    }

    if (envio.estado !== "PENDIENTE") {
      throw new ConflictError(
        `Solo se pueden modificar envíos en estado PENDIENTE (estado actual: ${envio.estado}).`
      );
    }

    if (envio.pedido?.estado !== "PENDIENTE") {
      throw new ConflictError(
        `Solo se puede modificar el envío si el pedido está en estado PENDIENTE (estado actual: ${envio.pedido?.estado}).`
      );
    }

    return envioRepository.actualizarEnvio(id, {
      domicilioEntrega: data.domicilioEntrega,
    });
  },

  async cancelarEnvio(id, usuarioAuth) {
    const envio = await envioRepository.obtenerEnvioPorId(id);

    if (!envio) {
      throw new NotFoundError(`No existe un envío con id ${id}.`);
    }

    // Si es CLIENTE, solo puede cancelar envíos de sus propios pedidos
    if (
      usuarioAuth.rol !== "ADMIN" &&
      envio.pedido?.usuarioDni !== usuarioAuth.dni
    ) {
      throw new ForbiddenError(
        "No tienes permisos para cancelar este envío."
      );
    }

    if (envio.estado === "CANCELADO") {
      throw new ConflictError("El envío ya se encuentra cancelado.");
    }

    if (envio.estado === "ENTREGADO") {
      throw new ConflictError(
        "No se puede cancelar un envío que ya ha sido entregado."
      );
    }

    if (envio.estado === "EN_TRANSITO") {
      throw new ConflictError(
        "No se puede cancelar un envío que ya se encuentra en tránsito."
      );
    }

    if (!ESTADOS_CANCELABLES_ENVIO.includes(envio.estado)) {
      throw new ConflictError(
        `No se puede cancelar un envío en estado ${envio.estado}.`
      );
    }

    if (envio.pedido?.estado === "CANCELADO") {
      throw new ConflictError(
        "No se puede cancelar el envío de un pedido que ya está cancelado."
      );
    }

    if (
      !ESTADOS_PEDIDO_PERMITEN_CANCELAR_ENVIO.includes(envio.pedido?.estado)
    ) {
      throw new ConflictError(
        `No se puede cancelar el envío porque el pedido se encuentra en estado ${envio.pedido?.estado}.`
      );
    }

    // Calcular el nuevo total restando el costo de envío (coincide exactamente con el subtotal)
    const nuevoTotal = envio.pedido.detalles
      ? envio.pedido.detalles.reduce(
          (acc, det) => acc + det.cantidad * Number(det.precioUnitario),
          0
        )
      : Math.max(0, Number(envio.pedido.total) - Number(envio.costo));

    return envioRepository.cancelarEnvioTransaccional({
      envioId: envio.id,
      pedidoId: envio.pedidoId,
      nuevoTotal,
    });
  },
};
