export function mapMedioPago(medioPago) {
  return {
    id: medioPago.id,
    descripcion: medioPago.descripcion,
  };
}

export function mapMediosPago(mediosPago) {
  return mediosPago.map(mapMedioPago);
}
