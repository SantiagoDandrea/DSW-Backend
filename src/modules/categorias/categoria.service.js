import { Prisma } from "@prisma/client";
import { categoriaRepository } from "./categoria.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_NOMBRE_DUPLICADO = "Ya existe una categoría con ese nombre.";
const MENSAJE_PRODUCTOS_ASOCIADOS =
  "No se puede eliminar esta categoría porque tiene productos asociados. Reasigná o eliminá esos productos primero.";

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
  return `No existe una categoría con id ${id}.`;
}

export const categoriaService = {
  async crearCategoria({ nombre }) {
    try {
      return await categoriaRepository.crearCategoria({ nombre });
    } catch (err) {
      if (esNombreDuplicado(err)) {
        throw new ConflictError(MENSAJE_NOMBRE_DUPLICADO);
      }
      throw err;
    }
  },

  obtenerCategorias() {
    return categoriaRepository.obtenerCategorias();
  },

  async obtenerCategoriaPorId(id) {
    const categoria = await categoriaRepository.obtenerCategoriaPorId(id);

    if (!categoria) {
      throw new NotFoundError(mensajeNoExiste(id));
    }

    return categoria;
  },

  async actualizarCategoria(id, { nombre }) {
    try {
      return await categoriaRepository.actualizarCategoria(id, { nombre });
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

  async eliminarCategoria(id) {
    try {
      await categoriaRepository.eliminarCategoria(id);
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
