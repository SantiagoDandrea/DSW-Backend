import { Prisma } from "@prisma/client";
import { almacenRepository } from "./almacen.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_STOCK_ASOCIADO =
  "No se puede eliminar este almacén porque tiene stock o pedidos asociados.";

function esRegistroNoEncontrado(err) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  );
}

function esRestriccionDeEliminacion(err) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2003" || err.code === "P2014")
  );
}

function mensajeNoExiste(id) {
  return `No existe un almacén con id ${id}.`;
}

export const almacenService = {
  async crearAlmacen({ descripcion, direccion }) {
    return almacenRepository.crearAlmacen({
      descripcion,
      direccion,
    });
  },

  obtenerAlmacenes() {
    return almacenRepository.obtenerAlmacenes();
  },

  async obtenerAlmacenPorId(id) {
    const almacen = await almacenRepository.obtenerAlmacenPorId(id);

    if (!almacen) {
      throw new NotFoundError(mensajeNoExiste(id));
    }

    return almacen;
  },

  async actualizarAlmacen(id, { descripcion, direccion }) {
    try {
      return await almacenRepository.actualizarAlmacen(id, {
        descripcion,
        direccion,
      });
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }

      throw err;
    }
  },

  async eliminarAlmacen(id) {
    try {
      await almacenRepository.eliminarAlmacen(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }

      if (esRestriccionDeEliminacion(err)) {
        throw new ConflictError(MENSAJE_STOCK_ASOCIADO);
      }

      throw err;
    }
  },
};