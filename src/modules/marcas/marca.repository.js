import { prisma } from "../../config/database.js";

export const marcaRepository = {
  crearMarca(data) {
    return prisma.marca.create({ data });
  },

  obtenerMarcas() {
    return prisma.marca.findMany({ orderBy: { nombre: "asc" } });
  },

  obtenerMarcaPorId(id) {
    return prisma.marca.findUnique({ where: { id } });
  },

  actualizarMarca(id, data) {
    return prisma.marca.update({ where: { id }, data });
  },

  eliminarMarca(id) {
    return prisma.marca.delete({ where: { id } });
  },
};
