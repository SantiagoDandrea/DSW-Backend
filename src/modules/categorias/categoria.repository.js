import { prisma } from "../../config/database.js";

export const categoriaRepository = {
  crearCategoria(data) {
    return prisma.categoria.create({ data });
  },

  obtenerCategorias() {
    return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
  },

  obtenerCategoriaPorId(id) {
    return prisma.categoria.findUnique({ where: { id } });
  },

  actualizarCategoria(id, data) {
    return prisma.categoria.update({ where: { id }, data });
  },

  eliminarCategoria(id) {
    return prisma.categoria.delete({ where: { id } });
  },
};
