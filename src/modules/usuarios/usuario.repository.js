import { prisma } from "../../config/database.js";

const USUARIO_INCLUDE = {
  localidad: true,
};

function construirWhere({ nombre, apellido, rol }) {
  const where = {};

  if (nombre !== undefined) {
    where.nombre = { contains: nombre };
  }

  if (apellido !== undefined) {
    where.apellido = { contains: apellido };
  }

  if (rol !== undefined) {
    where.rol = rol;
  }

  return where;
}

export const usuarioRepository = {
  crearUsuario(data) {
    return prisma.usuario.create({
      data,
      include: USUARIO_INCLUDE,
    });
  },

  obtenerUsuarios(filtros) {
    return prisma.usuario.findMany({
      where: construirWhere(filtros),
      include: USUARIO_INCLUDE,
      orderBy: { nombre: "asc" },
    });
  },

  obtenerUsuarioPorDni(dni) {
    return prisma.usuario.findUnique({
      where: { dni },
      include: USUARIO_INCLUDE,
    });
  },

  actualizarUsuario(dni, data) {
    return prisma.usuario.update({
      where: { dni },
      data,
      include: USUARIO_INCLUDE,
    });
  },

  eliminarUsuario(dni) {
    return prisma.usuario.delete({
      where: { dni },
    });
  },
};