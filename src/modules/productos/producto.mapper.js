export function mapProducto(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoriaId: producto.categoriaId,
    marcaId: producto.marcaId,
    proveedorId: producto.proveedorId,
  };
}

export function mapProductos(productos) {
  return productos.map(mapProducto);
}