import { Prisma } from "@prisma/client";
import { marcaRepository } from "./marca.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_NOMBRE_DUPLICADO = "Ya existe una marca con ese nombre.";
const MENSAJE_PRODUCTOS_ASOCIADOS =
  "No se puede eliminar esta marca porque tiene productos asociados. Reasigná o eliminá esos productos primero.";

function esNombreDuplicado(err) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

function esRegistroNoEncontrado(err) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

function esRestriccionDeEliminacion(err) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2003" || err.code === "P2014")
  );
}

function mensajeNoExiste(id) {
  return `No existe una marca con id ${id}.`;
}

export const marcaService = {
  async crearMarca({ nombre }) {
    try {
      return await marcaRepository.crearMarca({ nombre });
    } catch (err) {
      if (esNombreDuplicado(err)) {
        throw new ConflictError(MENSAJE_NOMBRE_DUPLICADO);
      }
      throw err;
    }
  },

  obtenerMarcas() {
    return marcaRepository.obtenerMarcas();
  },

  async obtenerMarcaPorId(id) {
    const marca = await marcaRepository.obtenerMarcaPorId(id);

    if (!marca) {
      throw new NotFoundError(mensajeNoExiste(id));
    }

    return marca;
  },

  async actualizarMarca(id, { nombre }) {
    try {
      return await marcaRepository.actualizarMarca(id, { nombre });
    } catch (err) {
      if (esNombreDuplicado(err)) {
        throw new ConflictError(MENSAJE_NOMBRE_DUPLICADO);
      }
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }
      throw err;
    }
  },

  async eliminarMarca(id) {
    try {
      await marcaRepository.eliminarMarca(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }
      if (esRestriccionDeEliminacion(err)) {
        throw new ConflictError(MENSAJE_PRODUCTOS_ASOCIADOS);
      }
      throw err;
    }
  },
};
