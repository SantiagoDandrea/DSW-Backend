import { Prisma } from "@prisma/client";
import { precioRepository } from "./precio.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_PRECIO_DUPLICADO =
  "Ya existe un precio para ese producto con esa fechaDesde.";

function esErrorPrisma(err, codigo) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === codigo
  );
}

function mensajeNoExistePrecio(id) {
  return `No existe un precio con id ${id}.`;
}

function mensajeNoExisteProducto(id) {
  return `No existe un producto con id ${id}.`;
}

async function asegurarProductoExiste(productoId) {
  const producto = await precioRepository.existeProducto(productoId);

  if (!producto) {
    throw new NotFoundError(mensajeNoExisteProducto(productoId));
  }
}

async function asegurarCombinacionDisponible(id, productoId, fechaDesde) {
  const precioExistente =
    await precioRepository.obtenerPrecioPorProductoYFecha(
      productoId,
      fechaDesde
    );

  if (precioExistente && precioExistente.id !== id) {
    throw new ConflictError(MENSAJE_PRECIO_DUPLICADO);
  }
}

export const precioService = {
  obtenerPrecios(filtros) {
    return precioRepository.obtenerPrecios(filtros);
  },

  async obtenerPrecioPorId(id) {
    const precio = await precioRepository.obtenerPrecioPorId(id);

    if (!precio) {
      throw new NotFoundError(mensajeNoExistePrecio(id));
    }

    return precio;
  },

  async crearPrecio({ productoId, valor, fechaDesde }) {
    await asegurarProductoExiste(productoId);

    const precioExistente =
      await precioRepository.obtenerPrecioPorProductoYFecha(
        productoId,
        fechaDesde
      );

    if (precioExistente) {
      throw new ConflictError(MENSAJE_PRECIO_DUPLICADO);
    }

    try {
      return await precioRepository.crearPrecio({
        productoId,
        valor,
        fechaDesde,
      });
    } catch (err) {
      if (esErrorPrisma(err, "P2002")) {
        throw new ConflictError(MENSAJE_PRECIO_DUPLICADO);
      }

      if (esErrorPrisma(err, "P2003")) {
        throw new NotFoundError(mensajeNoExisteProducto(productoId));
      }

      throw err;
    }
  },

  async actualizarPrecio(id, { productoId, valor, fechaDesde }) {
    const precio = await precioRepository.obtenerPrecioPorId(id);

    if (!precio) {
      throw new NotFoundError(mensajeNoExistePrecio(id));
    }

    await asegurarProductoExiste(productoId);
    await asegurarCombinacionDisponible(id, productoId, fechaDesde);

    try {
      return await precioRepository.actualizarPrecio(id, {
        productoId,
        valor,
        fechaDesde,
      });
    } catch (err) {
      if (esErrorPrisma(err, "P2025")) {
        throw new NotFoundError(mensajeNoExistePrecio(id));
      }

      if (esErrorPrisma(err, "P2002")) {
        throw new ConflictError(MENSAJE_PRECIO_DUPLICADO);
      }

      if (esErrorPrisma(err, "P2003")) {
        throw new NotFoundError(mensajeNoExisteProducto(productoId));
      }

      throw err;
    }
  },

  async eliminarPrecio(id) {
    try {
      await precioRepository.eliminarPrecio(id);
    } catch (err) {
      if (esErrorPrisma(err, "P2025")) {
        throw new NotFoundError(mensajeNoExistePrecio(id));
      }

      throw err;
    }
  },

  async obtenerHistorialPrecios(productoId) {
    await asegurarProductoExiste(productoId);
    return precioRepository.obtenerPreciosDeProducto(productoId);
  },
};
