export function mapMarca(marca) {
  return {
    id: marca.id,
    nombre: marca.nombre,
  };
}

export function mapMarcas(marcas) {
  return marcas.map(mapMarca);
}
