export function mapCategoria(categoria) {
  return {
    id: categoria.id,
    nombre: categoria.nombre,
  };
}

export function mapCategorias(categorias) {
  return categorias.map(mapCategoria);
}
