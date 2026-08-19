import { Prisma } from "@prisma/client";
import { medioPagoRepository } from "./medio-pago.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_DESCRIPCION_DUPLICADA = "Ya existe un medio de pago con esa descripción.";
const MENSAJE_PEDIDOS_ASOCIADOS =
  "No se puede eliminar este medio de pago porque tiene pedidos asociados. Reasigná o eliminá esos pedidos primero.";

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
  return `No existe un medio de pago con id ${id}.`;
}

export const medioPagoService = {
  async crearMedioPago({ descripcion }) {
    try {
      return await medioPagoRepository.crearMedioPago({ descripcion });
    } catch (err) {
      if (esNombreDuplicado(err)) {
        throw new ConflictError(MENSAJE_DESCRIPCION_DUPLICADA);
      }
      throw err;
    }
  },

  obtenerMediosPago() {
    return medioPagoRepository.obtenerMediosPago();
  },

  async obtenerMedioPagoPorId(id) {
    const medioPago = await medioPagoRepository.obtenerMedioPagoPorId(id);

    if (!medioPago) {
      throw new NotFoundError(mensajeNoExiste(id));
    }

    return medioPago;
  },

  async actualizarMedioPago(id, { descripcion }) {
    try {
      return await medioPagoRepository.actualizarMedioPago(id, { descripcion });
    } catch (err) {
      if (esNombreDuplicado(err)) {
        throw new ConflictError(MENSAJE_DESCRIPCION_DUPLICADA);
      }
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }
      throw err;
    }
  },

  async eliminarMedioPago(id) {
    try {
      await medioPagoRepository.eliminarMedioPago(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(id));
      }
      if (esRestriccionDeEliminacion(err)) {
        throw new ConflictError(MENSAJE_PEDIDOS_ASOCIADOS);
      }
      throw err;
    }
  },
};
