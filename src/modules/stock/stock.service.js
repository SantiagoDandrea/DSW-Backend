import { Prisma } from "@prisma/client";
import { stockRepository } from "./stock.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_STOCK_DUPLICADO =
  "Ya existe stock para ese producto en ese almacén.";

function esRegistroNoEncontrado(err) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

function esRestriccionDeIntegridad(err) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003"
  );
}

function mensajeNoExiste(id) {
  return `No existe un registro de stock con id ${id}.`;
}

export const stockService = {
  obtenerStocks(filtros) {
    return stockRepository.obtenerStocks(filtros);
  },

  async obtenerStockPorId(id) {
    const stock = await stockRepository.obtenerStockPorId(id);

    if (!stock) {
      throw new NotFoundError(mensajeNoExiste(id));
    }

    return stock;
  },

  async crearStock({ productoId, almacenId, cantidad }) {
    const stockExistente =
      await stockRepository.obtenerStockPorProductoYAlmacen(
        productoId,
        almacenId,
      );

    if (stockExistente) {
      throw new ConflictError(MENSAJE_STOCK_DUPLICADO);
    }

    try {
      return await stockRepository.crearStock({
        productoId,
        almacenId,
        cantidad,
      });
    } catch (err) {
      if (esRestriccionDeIntegridad(err)) {
        throw new NotFoundError(
          "El producto o el almacén especificado no existe.",
        );
      }

      throw err;
    }
  },

  async actualizarStock(id, { productoId, almacenId, cantidad }) {
    try {
      return await stockRepository.actualizarStock(id, {
        productoId,
        almacenId,
        cantidad,
      });
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }

      if (esRestriccionDeIntegridad(err)) {
        throw new NotFoundError(
          "El producto o el almacén especificado no existe.",
        );
      }

      throw err;
    }
  },

  async eliminarStock(id) {
    try {
      await stockRepository.eliminarStock(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }

      throw err;
    }
  },
};
