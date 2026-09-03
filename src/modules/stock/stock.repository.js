import { prisma } from "../../config/database.js";

export const stockRepository = {
  crearStock(data) {
    return prisma.stock.create({ data });
  },

  obtenerStocks({ productoId, almacenId } = {}) {
    const where = {};

    if (productoId !== undefined) {
      where.productoId = productoId;
    }

    if (almacenId !== undefined) {
      where.almacenId = almacenId;
    }

    return prisma.stock.findMany({
      where,
      orderBy: { id: "asc" },
    });
  },

  obtenerStockPorId(id) {
    return prisma.stock.findUnique({
      where: { id },
    });
  },

  obtenerStockPorProductoYAlmacen(productoId, almacenId) {
    return prisma.stock.findUnique({
      where: {
        productoId_almacenId: {
          productoId,
          almacenId,
        },
      },
    });
  },

  actualizarStock(id, data) {
    return prisma.stock.update({
      where: { id },
      data,
    });
  },

  eliminarStock(id) {
    return prisma.stock.delete({
      where: { id },
    });
  },
};