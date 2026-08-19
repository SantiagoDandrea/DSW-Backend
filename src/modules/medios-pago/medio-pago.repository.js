import { prisma } from "../../config/database.js";

export const medioPagoRepository = {
  crearMedioPago(data) {
    return prisma.medioPago.create({ data });
  },

  obtenerMediosPago() {
    return prisma.medioPago.findMany({ orderBy: { descripcion: "asc" } });
  },

  obtenerMedioPagoPorId(id) {
    return prisma.medioPago.findUnique({ where: { id } });
  },

  actualizarMedioPago(id, data) {
    return prisma.medioPago.update({ where: { id }, data });
  },

  eliminarMedioPago(id) {
    return prisma.medioPago.delete({ where: { id } });
  },
};
