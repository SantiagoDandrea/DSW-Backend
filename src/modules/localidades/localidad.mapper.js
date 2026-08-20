export function mapLocalidad(localidad) {
  return {
    id: localidad.id,
    nombre: localidad.nombre,
    codigoPostal: localidad.codigoPostal,
    provincia: localidad.provincia,
  };
}

export function mapLocalidades(localidades) {
  return localidades.map(mapLocalidad);
}
