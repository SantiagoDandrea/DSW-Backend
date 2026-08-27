import { Prisma } from "@prisma/client";
import { productoRepository } from "./producto.repository.js";
import { categoriaRepository } from "../categorias/categoria.repository.js";
import { marcaRepository } from "../marcas/marca.repository.js";
import { proveedorRepository } from "../proveedores/proveedor.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const MENSAJE_REGISTROS_ASOCIADOS =
  "No se puede eliminar este producto porque tiene stock o pedidos asociados. Reasigná o eliminá esos registros primero.";

function esRegistroNoEncontrado(err) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

function esRestriccionDeEliminacion(err) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2003" || err.code === "P2014")
  );
}

function mensajeNoExisteProducto(id) {
  return `No existe un producto con id ${id}.`;
}

async function validarReferencias({ categoriaId, marcaId, proveedorId }) {
  const [categoria, marca, proveedor] = await Promise.all([
    categoriaRepository.obtenerCategoriaPorId(categoriaId),
    marcaRepository.obtenerMarcaPorId(marcaId),
    proveedorRepository.obtenerProveedorPorId(proveedorId),
  ]);

  if (!categoria) {
    throw new NotFoundError(`No existe una categoría con id ${categoriaId}.`);
  }
  if (!marca) {
    throw new NotFoundError(`No existe una marca con id ${marcaId}.`);
  }
  if (!proveedor) {
    throw new NotFoundError(`No existe un proveedor con id ${proveedorId}.`);
  }
}

async function asegurarProductoExiste(productoId) {
  const producto = await productoRepository.existeProducto(productoId);

  if (!producto) {
    throw new NotFoundError(mensajeNoExisteProducto(productoId));
  }
}

export const productoService = {
  async crearProducto({ nombre, descripcion, categoriaId, marcaId, proveedorId, precio }) {
    await validarReferencias({ categoriaId, marcaId, proveedorId });

    return productoRepository.crearProductoConPrecio({
      nombre,
      descripcion,
      categoriaId,
      marcaId,
      proveedorId,
      precio,
    });
  },

  async obtenerProductos(filtros) {
    const productos = await productoRepository.obtenerProductos(filtros);

    if (filtros.precioMin === undefined && filtros.precioMax === undefined) {
      return productos;
    }

    return productos.filter((producto) => {
      const precioVigente = producto.precios[0] ? Number(producto.precios[0].valor) : null;

      if (precioVigente === null) {
        return false;
      }
      if (filtros.precioMin !== undefined && precioVigente < filtros.precioMin) {
        return false;
      }
      if (filtros.precioMax !== undefined && precioVigente > filtros.precioMax) {
        return false;
      }
      return true;
    });
  },

  async obtenerProductoPorId(id) {
    const producto = await productoRepository.obtenerProductoPorId(id);

    if (!producto) {
      throw new NotFoundError(mensajeNoExisteProducto(id));
    }

    return producto;
  },

  async actualizarProducto(id, { nombre, descripcion, categoriaId, marcaId, proveedorId }) {
    await validarReferencias({ categoriaId, marcaId, proveedorId });

    try {
      return await productoRepository.actualizarProducto(id, {
        nombre,
        descripcion,
        categoriaId,
        marcaId,
        proveedorId,
      });
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExisteProducto(id));
      }
      throw err;
    }
  },

  async eliminarProducto(id) {
    try {
      await productoRepository.eliminarProducto(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExisteProducto(id));
      }
      if (esRestriccionDeEliminacion(err)) {
        throw new ConflictError(MENSAJE_REGISTROS_ASOCIADOS);
      }
      throw err;
    }
  },

  async agregarPrecio(productoId, { valor }) {
    await asegurarProductoExiste(productoId);
    return productoRepository.crearPrecio({ productoId, valor });
  },

  async obtenerHistorialPrecios(productoId) {
    await asegurarProductoExiste(productoId);
    return productoRepository.obtenerPreciosDeProducto(productoId);
  },

  async agregarImagen(productoId, { url, orden }) {
    await asegurarProductoExiste(productoId);
    return productoRepository.crearImagen({ productoId, url, orden });
  },

  async obtenerImagenes(productoId) {
    await asegurarProductoExiste(productoId);
    return productoRepository.obtenerImagenesDeProducto(productoId);
  },

  async eliminarImagen(id) {
    try {
      await productoRepository.eliminarImagen(id);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(`No existe una imagen con id ${id}.`);
      }
      throw err;
    }
  },
};
