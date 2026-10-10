export function mapImagen(imagen) {
  return {
    id: imagen.id,
    url: imagen.url,
    orden: imagen.orden,
  };
}

export function mapImagenes(imagenes) {
  return imagenes.map(mapImagen);
}

export function mapProducto(producto) {
  const stockDisponible = (producto.stock ?? []).reduce(
    (total, s) => total + (s.cantidad || 0),
    0
  );

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: { id: producto.categoria.id, nombre: producto.categoria.nombre },
    marca: { id: producto.marca.id, nombre: producto.marca.nombre },
    proveedor: producto.proveedor
      ? { id: producto.proveedor.id, nombre: producto.proveedor.nombre }
      : null,
    precioActual: producto.precios[0] ? Number(producto.precios[0].valor) : null,
    disponible: stockDisponible > 0,
    stockDisponible,
    imagenes: mapImagenes(producto.imagenes),
  };
}

export function mapProductos(productos) {
  return productos.map(mapProducto);
}
