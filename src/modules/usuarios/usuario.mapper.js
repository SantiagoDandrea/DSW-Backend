export function mapUsuario(usuario) {
  return {
    dni: usuario.dni,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    activo: usuario.activo,
    rol: usuario.rol,
    localidad: usuario.localidad
      ? {
          id: usuario.localidad.id,
          nombre: usuario.localidad.nombre,
          provincia: usuario.localidad.provincia,
          codigoPostal: usuario.localidad.codigoPostal,
        }
      : null,
  };
}

export function mapUsuarios(usuarios) {
  return usuarios.map(mapUsuario);
}
