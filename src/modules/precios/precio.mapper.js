export function mapPrecio(precio) {
  return {
    id: precio.id,
    productoId: precio.productoId,
    valor: Number(precio.valor),
    fechaDesde: precio.fechaDesde,
  };
}

export function mapPrecios(precios) {
  return precios.map(mapPrecio);
}
