import { prisma } from "../../config/database.js";

function construirWhere({ productoId, fechaDesde, fechaHasta } = {}) {
  const where = {};

  if (productoId !== undefined) {
    where.productoId = productoId;
  }

  if (fechaDesde !== undefined || fechaHasta !== undefined) {
    where.fechaDesde = {};

    if (fechaDesde !== undefined) {
      where.fechaDesde.gte = fechaDesde;
    }

    if (fechaHasta !== undefined) {
      where.fechaDesde.lte = fechaHasta;
    }
  }

  return where;
}

export const precioRepository = {
  crearPrecio(data) {
    return prisma.precio.create({ data });
  },

  obtenerPrecios(filtros) {
    return prisma.precio.findMany({
      where: construirWhere(filtros),
      orderBy: { fechaDesde: "desc" },
    });
  },

  obtenerPrecioPorId(id) {
    return prisma.precio.findUnique({
      where: { id },
    });
  },

  obtenerPrecioPorProductoYFecha(productoId, fechaDesde) {
    return prisma.precio.findUnique({
      where: {
        productoId_fechaDesde: {
          productoId,
          fechaDesde,
        },
      },
    });
  },

  existeProducto(productoId) {
    return prisma.producto.findUnique({
      where: { id: productoId },
      select: { id: true },
    });
  },

  obtenerPreciosDeProducto(productoId) {
    return prisma.precio.findMany({
      where: { productoId },
      orderBy: { fechaDesde: "desc" },
    });
  },

  contarPreciosQueRigenExcepto(productoId, idExcluido, fecha = new Date()) {
    return prisma.precio.count({
      where: {
        productoId,
        id: { not: idExcluido },
        fechaDesde: { lte: fecha },
      },
    });
  },

  actualizarPrecio(id, data) {
    return prisma.precio.update({
      where: { id },
      data,
    });
  },

  eliminarPrecio(id) {
    return prisma.precio.delete({
      where: { id },
    });
  },
};
