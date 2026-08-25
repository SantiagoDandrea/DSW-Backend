export function mapProveedor(proveedor) {
  return {
    id: proveedor.id,
    nombre: proveedor.nombre,
    cuit: proveedor.cuit,
    telefono: proveedor.telefono,
  };
}

export function mapProveedores(proveedores) {
  return proveedores.map(mapProveedor);
}
