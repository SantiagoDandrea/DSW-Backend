import { Prisma } from "@prisma/client";
import { precioRepository } from "./precio.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { ValidationError } from "../../errors/ValidationError.js";

const MENSAJE_PRECIO_DUPLICADO =
  "Ya existe un precio para ese producto con esa fechaDesde.";
const MENSAJE_UNICO_PRECIO_VIGENTE =
  "No se puede eliminar el único precio vigente del producto. Cargá otro precio que ya rija antes de eliminarlo.";
const MENSAJE_UNICO_PRECIO_A_FUTURO =
  "No se puede pasar a una fecha futura el único precio vigente del producto. Cargá otro precio que ya rija primero.";
const MENSAJE_CAMBIO_PRODUCTO =
  "No se puede cambiar el producto de un precio. Eliminalo y cargalo en el producto correcto.";

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

// Un precio que ya rige no puede dejar de regir si no queda otro que rija en su lugar
async function asegurarQueQuedeOtroVigente(precio, mensaje) {
  const otrosQueRigen = await precioRepository.contarPreciosQueRigenExcepto(
    precio.productoId,
    precio.id
  );

  if (otrosQueRigen === 0) {
    throw new ConflictError(mensaje);
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

    if (productoId !== precio.productoId) {
      throw new ValidationError(MENSAJE_CAMBIO_PRODUCTO);
    }

    const ahora = new Date();
    if (precio.fechaDesde <= ahora && fechaDesde > ahora) {
      await asegurarQueQuedeOtroVigente(precio, MENSAJE_UNICO_PRECIO_A_FUTURO);
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
    const precio = await precioRepository.obtenerPrecioPorId(id);

    if (!precio) {
      throw new NotFoundError(mensajeNoExistePrecio(id));
    }

    if (precio.fechaDesde <= new Date()) {
      await asegurarQueQuedeOtroVigente(precio, MENSAJE_UNICO_PRECIO_VIGENTE);
    }

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
