export function mapUsuario(usuario) {
  return {
    dni: usuario.dni,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
    localidad: { id: usuario.localidad.id, nombre: usuario.localidad.nombre },
  };
}

export function mapUsuarios(usuarios) {
  return usuarios.map(mapUsuario);
}
