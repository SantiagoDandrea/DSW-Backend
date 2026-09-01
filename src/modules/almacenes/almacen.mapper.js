function mapearAlmacen(almacen) {
  return {
    id: almacen.id,
    descripcion: almacen.descripcion,
    direccion: almacen.direccion,
  };
}

export const almacenMapper = {
  mapearAlmacen,

  mapearAlmacenes(almacenes) {
    return almacenes.map(mapearAlmacen);
  },
};