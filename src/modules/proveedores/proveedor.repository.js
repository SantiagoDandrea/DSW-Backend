import { prisma } from "../../config/database.js";

export const proveedorRepository = {
  crearProveedor(data) {
    return prisma.proveedor.create({ data });
  },

  obtenerProveedores() {
    return prisma.proveedor.findMany({ orderBy: { nombre: "asc" } });
  },

  obtenerProveedorPorId(id) {
    return prisma.proveedor.findUnique({ where: { id } });
  },

  actualizarProveedor(id, data) {
    return prisma.proveedor.update({ where: { id }, data });
  },

  eliminarProveedor(id) {
    return prisma.proveedor.delete({ where: { id } });
  },
};
