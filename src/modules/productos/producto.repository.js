import { prisma } from "../../config/database.js";

function obtenerProductoInclude() {
  return {
    categoria: true,
    marca: true,
    proveedor: true,
    precios: {
      where: {
        fechaDesde: {
          lte: new Date(),
        },
      },
      orderBy: { fechaDesde: "desc" },
      take: 1,
    },
    imagenes: {
      orderBy: [{ orden: "asc" }, { id: "asc" }],
    },
  };
}

function construirWhere({ categoriaId, marcaId, nombre }) {
  const where = {};

  if (categoriaId !== undefined) {
    where.categoriaId = categoriaId;
  }

  if (marcaId !== undefined) {
    where.marcaId = marcaId;
  }

  if (nombre !== undefined && nombre.length > 0) {
    where.nombre = { contains: nombre };
  }

  return where;
}

export const productoRepository = {
  crearProductoConPrecio({ nombre, descripcion, categoriaId, marcaId, proveedorId, precio }) {
    return prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: { nombre, descripcion, categoriaId, marcaId, proveedorId },
      });

      await tx.precio.create({
        data: {
          productoId: producto.id,
          valor: precio,
          fechaDesde: new Date(),
        },
      });

      return tx.producto.findUnique({
        where: { id: producto.id },
        include: obtenerProductoInclude(),
      });
    });
  },

  obtenerProductos(filtros) {
    return prisma.producto.findMany({
      where: construirWhere(filtros),
      include: obtenerProductoInclude(),
      orderBy: { nombre: "asc" },
    });
  },

  obtenerProductoPorId(id) {
    return prisma.producto.findUnique({
      where: { id },
      include: obtenerProductoInclude(),
    });
  },

  existeProducto(id) {
    return prisma.producto.findUnique({
      where: { id },
      select: { id: true },
    });
  },

  actualizarProducto(id, data) {
    return prisma.producto.update({
      where: { id },
      data,
      include: obtenerProductoInclude(),
    });
  },

  eliminarProducto(id) {
    return prisma.producto.delete({ where: { id } });
  },

  crearImagen({ productoId, url, orden }) {
    return prisma.imagenProducto.create({
      data: { productoId, url, orden },
    });
  },

  obtenerImagenesDeProducto(productoId) {
    return prisma.imagenProducto.findMany({
      where: { productoId },
      orderBy: [{ orden: "asc" }, { id: "asc" }],
    });
  },

  eliminarImagen(id) {
    return prisma.imagenProducto.delete({ where: { id } });
  },
};
