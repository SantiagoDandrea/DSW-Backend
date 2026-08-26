import { prisma } from "../../config/database.js";

export const productoRepository = {
  crearProducto(data) {
    return prisma.producto.create({ data });
  },
  obtenerProductos() {
    return prisma.producto.findMany({ orderBy: { nombre: "asc" } });
  },
  obtenerProductoPorId(id) {
    return prisma.producto.findUnique({ where: { id } });
  },
  actualizarProducto(id, data) {
    return prisma.producto.update({ where: { id }, data });
  },
  eliminarProducto(id) {
    return prisma.producto.delete({ where: { id } });
  },
};