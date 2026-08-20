import { Prisma } from "@prisma/client";
import { localidadRepository } from "./localidad.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_USUARIOS_ASOCIADOS =
  "No se puede eliminar esta localidad porque tiene usuarios asociados. Reasigná o eliminá esos usuarios primero.";
const MENSAJE_LOCALIDAD_DUPLICADA =
  "Ya existe una localidad con ese nombre y código postal.";

function esCombinacionDuplicada(err) {
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
  return `No existe una localidad con id ${id}.`;
}

export const localidadService = {
  async crearLocalidad({ nombre, provincia, codigoPostal }) {
    try {
      return await localidadRepository.crearLocalidad({ nombre, provincia, codigoPostal });
    } catch (err) {
      if (esCombinacionDuplicada(err)) {
        throw new ConflictError(MENSAJE_LOCALIDAD_DUPLICADA);
      }
      throw err;
    }
  },

    obtenerLocalidades() {
    return localidadRepository.obtenerLocalidades();
  },

  async obtenerLocalidadPorId(id) {
    const localidad = await localidadRepository.obtenerLocalidadPorId(id);

    if (!localidad) {
      throw new NotFoundError(mensajeNoExiste(id));
    }

    return localidad;
  },

  async actualizarLocalidad(id, { nombre, provincia, codigoPostal }) {
    try {
      return await localidadRepository.actualizarLocalidad(id, { nombre, provincia, codigoPostal });
    } catch (err) {
      if (esCombinacionDuplicada(err)) {
        throw new ConflictError(MENSAJE_LOCALIDAD_DUPLICADA);
      }
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }
      throw err;
    }
  },

  async eliminarLocalidad(id) {
    try {
      await localidadRepository.eliminarLocalidad(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }
      if (esRestriccionDeEliminacion(err)) {
        throw new ConflictError(MENSAJE_USUARIOS_ASOCIADOS);
      }
      throw err;
    }
  },
};
