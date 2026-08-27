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

export function mapPrecio(precio) {
  return {
    id: precio.id,
    valor: Number(precio.valor),
    fechaDesde: precio.fechaDesde,
  };
}

export function mapPrecios(precios) {
  return precios.map(mapPrecio);
}

export function mapProducto(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: { id: producto.categoria.id, nombre: producto.categoria.nombre },
    marca: { id: producto.marca.id, nombre: producto.marca.nombre },
    proveedor: { id: producto.proveedor.id, nombre: producto.proveedor.nombre },
    precioActual: producto.precios[0] ? Number(producto.precios[0].valor) : null,
    imagenes: mapImagenes(producto.imagenes),
  };
}

export function mapProductos(productos) {
  return productos.map(mapProducto);
}
