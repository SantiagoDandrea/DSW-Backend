import { prisma } from "../../config/database.js";

export const almacenRepository = {
  crearAlmacen(data) {
    return prisma.almacen.create({ data });
  },

  obtenerAlmacenes() {
    return prisma.almacen.findMany({
      orderBy: { descripcion: "asc" },
    });
  },

  obtenerAlmacenPorId(id) {
    return prisma.almacen.findUnique({
      where: { id },
    });
  },

  actualizarAlmacen(id, data) {
    return prisma.almacen.update({
      where: { id },
      data,
    });
  },

  eliminarAlmacen(id) {
    return prisma.almacen.delete({
      where: { id },
    });
  },
};