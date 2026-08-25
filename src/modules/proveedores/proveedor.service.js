import { Prisma } from "@prisma/client";
import { proveedorRepository } from "./proveedor.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_CUIT_DUPLICADO = "Ya existe un proveedor con ese CUIT.";
const MENSAJE_PRODUCTOS_ASOCIADOS =
  "No se puede eliminar este proveedor porque tiene productos asociados. Reasigná o eliminá esos productos primero.";

function esCuitDuplicado(err) {
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
  return `No existe un proveedor con id ${id}.`;
}

export const proveedorService = {
  async crearProveedor({ nombre, cuit, telefono }) {
    try {
      return await proveedorRepository.crearProveedor({ nombre, cuit, telefono });
    } catch (err) {
      if (esCuitDuplicado(err)) {
        throw new ConflictError(MENSAJE_CUIT_DUPLICADO);
      }
      throw err;
    }
  },

  obtenerProveedores() {
    return proveedorRepository.obtenerProveedores();
  },

  async obtenerProveedorPorId(id) {
    const proveedor = await proveedorRepository.obtenerProveedorPorId(id);

    if (!proveedor) {
      throw new NotFoundError(mensajeNoExiste(id));
    }

    return proveedor;
  },

  async actualizarProveedor(id, { nombre, cuit, telefono }) {
    try {
      return await proveedorRepository.actualizarProveedor(id, { nombre, cuit, telefono });
    } catch (err) {
      if (esCuitDuplicado(err)) {
        throw new ConflictError(MENSAJE_CUIT_DUPLICADO);
      }
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }
      throw err;
    }
  },

  async eliminarProveedor(id) {
    try {
      await proveedorRepository.eliminarProveedor(id);
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
