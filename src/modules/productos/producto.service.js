import { Prisma } from "@prisma/client";
import { productoRepository } from "./producto.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_RELACION_INEXISTENTE =
  "La categoría, marca o proveedor indicado no existe.";
const MENSAJE_REGISTROS_ASOCIADOS =
  "No se puede eliminar este producto porque tiene stock o pedidos asociados.";

function esRelacionInexistente(err) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003";  //P2003 en Prisma quiere decir genéricamente "violación de una restricción de clave foránea"
}
function esRegistroNoEncontrado(err) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"; //P2025 en Prisma quiere decir genéricamente "registro no encontrado"
}
function esRestriccionDeEliminacion(err) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2003" || err.code === "P2014")
  );
}
function mensajeNoExiste(id) {
  return `No existe un producto con id ${id}.`;
}

export const productoService = {
  async crearProducto(datos) {
    try {
      return await productoRepository.crearProducto(datos);
    } catch (err) {
      if (esRelacionInexistente(err)) throw new ConflictError(MENSAJE_RELACION_INEXISTENTE);
      throw err;   //Al crear/actualizar: intentás que un producto apunte hacia una categoría/marca/proveedor que no existe
    }
  },
  obtenerProductos() {
    return productoRepository.obtenerProductos();
  },
  async obtenerProductoPorId(id) {
    const producto = await productoRepository.obtenerProductoPorId(id);
    if (!producto) throw new NotFoundError(mensajeNoExiste(id));
    return producto;
  },
  async actualizarProducto(id, datos) {
    try {
      return await productoRepository.actualizarProducto(id, datos);
    } catch (err) {
      if (esRelacionInexistente(err)) throw new ConflictError(MENSAJE_RELACION_INEXISTENTE);
      if (esRegistroNoEncontrado(err)) throw new NotFoundError(mensajeNoExiste(id));
      throw err;
    }
  },
  async eliminarProducto(id) {   //Al eliminar: intentás borrar un producto que otros registros apuntan hacia él
    try {
      await productoRepository.eliminarProducto(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) throw new NotFoundError(mensajeNoExiste(id));
      if (esRestriccionDeEliminacion(err)) throw new ConflictError(MENSAJE_REGISTROS_ASOCIADOS);
      throw err;
    }
  },
};