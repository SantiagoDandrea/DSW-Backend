import { prisma } from "../../config/database.js";

const PEDIDO_LISTADO_INCLUDE = {
  usuario: {
    select: {
      dni: true,
      nombre: true,
      apellido: true,
      email: true,
    },
  },
  medioPago: {
    select: {
      id: true,
      descripcion: true,
    },
  },
  envio: {
    select: {
      id: true,
      costo: true,
      domicilioEntrega: true,
      estado: true,
    },
  },
};

const PEDIDO_DETALLE_INCLUDE = {
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
  medioPago: {
    select: {
      id: true,
      descripcion: true,
    },
  },
  detalles: {
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
        },
      },
      almacen: {
        select: {
          id: true,
          descripcion: true,
          direccion: true,
        },
      },
    },
    orderBy: { id: "asc" },
  },
  envio: true,
};

function construirWhere({ estado, usuarioDni, fechaDesde, fechaHasta } = {}) {
  const where = {};

  if (estado !== undefined) {
    where.estado = estado;
  }

  if (usuarioDni !== undefined) {
    where.usuarioDni = usuarioDni;
  }

  if (fechaDesde !== undefined || fechaHasta !== undefined) {
    where.fecha = {};

    if (fechaDesde !== undefined) {
      where.fecha.gte = fechaDesde;
    }

    if (fechaHasta !== undefined) {
      where.fecha.lte = fechaHasta;
    }
  }

  return where;
}

export const pedidoRepository = {
  obtenerPedidos(filtros) {
    return prisma.pedido.findMany({
      where: construirWhere(filtros),
      include: PEDIDO_LISTADO_INCLUDE,
      orderBy: { fecha: "desc" },
    });
  },

  obtenerPedidoPorId(id) {
    return prisma.pedido.findUnique({
      where: { id },
      include: PEDIDO_DETALLE_INCLUDE,
    });
  },

  obtenerUsuarioConLocalidad(dni) {
    return prisma.usuario.findUnique({
      where: { dni },
      include: { localidad: true },
    });
  },

  obtenerMedioPago(id) {
    return prisma.medioPago.findUnique({
      where: { id },
    });
  },

  obtenerProducto(id) {
    return prisma.producto.findUnique({
      where: { id },
      select: { id: true, nombre: true },
    });
  },

  obtenerPrecioVigente(productoId, fecha = new Date()) {
    return prisma.precio.findFirst({
      where: {
        productoId,
        fechaDesde: {
          lte: fecha,
        },
      },
      orderBy: { fechaDesde: "desc" },
    });
  },

  obtenerStockPorProducto(productoId) {
    return prisma.stock.findMany({
      where: { productoId },
      include: {
        almacen: {
          select: { id: true, descripcion: true },
        },
      },
      orderBy: { almacenId: "asc" },
    });
  },

  crearPedidoTransaccional({
    usuarioDni,
    medioPagoId,
    detallesDistribuidos,
    costoEnvio,
    datosEnvio,
    total,
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Descontar stock atómicamente para cada asignación almacén-producto
      for (const item of detallesDistribuidos) {
        const resultado = await tx.stock.updateMany({
          where: {
            id: item.stockId,
            cantidad: {
              gte: item.cantidad,
            },
          },
          data: {
            cantidad: {
              decrement: item.cantidad,
            },
          },
        });

        if (resultado.count === 0) {
          throw new Error(`STOCK_INSUFICIENTE_${item.productoId}`);
        }
      }

      // 2. Crear pedido junto con sus detalles y el envío si corresponde
      const pedidoCreado = await tx.pedido.create({
        data: {
          usuarioDni,
          medioPagoId,
          estado: "PENDIENTE",
          fecha: new Date(),
          total,
          detalles: {
            create: detallesDistribuidos.map((item) => ({
              productoId: item.productoId,
              almacenId: item.almacenId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
            })),
          },
          ...(datosEnvio
            ? {
                envio: {
                  create: {
                    domicilioEntrega: datosEnvio.domicilioEntrega,
                    costo: costoEnvio,
                    estado: "PENDIENTE",
                  },
                },
              }
            : {}),
        },
      });

      // 3. Devolver el pedido completo con todas sus relaciones cargadas
      return tx.pedido.findUnique({
        where: { id: pedidoCreado.id },
        include: PEDIDO_DETALLE_INCLUDE,
      });
    });
  },

  actualizarEstadoPedido(id, nuevoEstado, nuevoEstadoEnvio) {
    return prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id },
        data: { estado: nuevoEstado },
      });

      if (nuevoEstadoEnvio) {
        const dataEnvio = { estado: nuevoEstadoEnvio };
        if (nuevoEstadoEnvio === "ENTREGADO") {
          dataEnvio.fechaEntregado = new Date();
        }

        await tx.envio.updateMany({
          where: {
            pedidoId: id,
            estado: { not: "CANCELADO" },
          },
          data: dataEnvio,
        });
      }

      return tx.pedido.findUnique({
        where: { id },
        include: PEDIDO_DETALLE_INCLUDE,
      });
    });
  },

  cancelarPedidoTransaccional(id, detalles) {
    return prisma.$transaction(async (tx) => {
      // 1. Cambiar estado del pedido a CANCELADO
      await tx.pedido.update({
        where: { id },
        data: { estado: "CANCELADO" },
      });

      // 2. Cambiar estado de envío a CANCELADO si existe
      await tx.envio.updateMany({
        where: { pedidoId: id },
        data: { estado: "CANCELADO" },
      });

      // 3. Revertir exactamente las unidades a cada almacén registrado
      for (const detalle of detalles) {
        await tx.stock.update({
          where: {
            productoId_almacenId: {
              productoId: detalle.productoId,
              almacenId: detalle.almacenId,
            },
          },
          data: {
            cantidad: {
              increment: detalle.cantidad,
            },
          },
        });
      }

      return tx.pedido.findUnique({
        where: { id },
        include: PEDIDO_DETALLE_INCLUDE,
      });
    });
  },

  actualizarPedido(id, data) {
    const dataUpdate = {};

    if (data.medioPagoId !== undefined) {
      dataUpdate.medioPagoId = data.medioPagoId;
    }

    if (data.domicilioEntrega !== undefined) {
      dataUpdate.envio = {
        update: {
          domicilioEntrega: data.domicilioEntrega,
        },
      };
    }

    return prisma.pedido.update({
      where: { id },
      data: dataUpdate,
      include: PEDIDO_DETALLE_INCLUDE,
    });
  },

  eliminarPedido(id) {
    return prisma.pedido.delete({
      where: { id },
    });
  },
};
