import { prisma } from "../../config/database.js";

const ENVIO_LISTADO_INCLUDE = {
  pedido: {
    select: {
      id: true,
      fecha: true,
      estado: true,
      total: true,
      usuarioDni: true,
      usuario: {
        select: {
          dni: true,
          nombre: true,
          apellido: true,
          email: true,
          localidad: {
            select: {
              id: true,
              nombre: true,
              provincia: true,
              codigoPostal: true,
            },
          },
        },
      },
    },
  },
};

const ENVIO_DETALLE_INCLUDE = {
  pedido: {
    include: {
      usuario: {
        select: {
          dni: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          localidad: {
            select: {
              id: true,
              nombre: true,
              provincia: true,
              codigoPostal: true,
            },
          },
        },
      },
      detalles: true,
    },
  },
};

export const envioRepository = {
  obtenerEnvios(where = {}) {
    return prisma.envio.findMany({
      where,
      include: ENVIO_LISTADO_INCLUDE,
      orderBy: { id: "desc" },
    });
  },

  obtenerEnvioPorId(id) {
    return prisma.envio.findUnique({
      where: { id },
      include: ENVIO_DETALLE_INCLUDE,
    });
  },

  obtenerEnvioPorPedidoId(pedidoId) {
    return prisma.envio.findUnique({
      where: { pedidoId },
      include: ENVIO_DETALLE_INCLUDE,
    });
  },

  actualizarEnvio(id, data) {
    return prisma.envio.update({
      where: { id },
      data,
      include: ENVIO_DETALLE_INCLUDE,
    });
  },

  cancelarEnvioTransaccional({ envioId, pedidoId, nuevoTotal }) {
    return prisma.$transaction(async (tx) => {
      // 1. Actualizar estado del envío a CANCELADO
      await tx.envio.update({
        where: { id: envioId },
        data: { estado: "CANCELADO" },
      });

      // 2. Actualizar el total del pedido restando el costo de envío
      await tx.pedido.update({
        where: { id: pedidoId },
        data: { total: nuevoTotal },
      });

      // 3. Devolver el envío actualizado con los datos del pedido
      return tx.envio.findUnique({
        where: { id: envioId },
        include: ENVIO_DETALLE_INCLUDE,
      });
    });
  },
};
