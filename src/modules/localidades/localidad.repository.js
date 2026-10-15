import { prisma } from "../../config/database.js";

export const localidadRepository = {
  crearLocalidad(data) {
    return prisma.localidad.create({ data });
  },

  obtenerLocalidades() {
    return prisma.localidad.findMany({
      orderBy: [{ provincia: "asc" }, { nombre: "asc" }],
    });
  },

  obtenerLocalidadPorId(id) {
    return prisma.localidad.findUnique({ where: { id } });
  },

  actualizarLocalidad(id, data) {
    return prisma.localidad.update({ where: { id }, data });
  },

  obtenerLocalidadPorNombreYCp(nombre, codigoPostal) {
    return prisma.localidad.findFirst({
      where: {
        nombre: { equals: nombre },
        codigoPostal: { equals: codigoPostal },
      },
    });
  },

  eliminarLocalidad(id) {
    return prisma.localidad.delete({ where: { id } });
  },
};
