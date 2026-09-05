export function mapEnvio(envio) {
  if (!envio) return null;

  return {
    id: envio.id,
    pedidoId: envio.pedidoId,
    domicilioEntrega: envio.domicilioEntrega,
    costo: Number(envio.costo),
    fechaTentativa: envio.fechaTentativa,
    fechaEntregado: envio.fechaEntregado,
    estado: envio.estado,
    pedido: envio.pedido
      ? {
          id: envio.pedido.id,
          fecha: envio.pedido.fecha,
          estado: envio.pedido.estado,
          total: Number(envio.pedido.total),
          cliente: envio.pedido.usuario
            ? {
                dni: envio.pedido.usuario.dni,
                nombre: envio.pedido.usuario.nombre,
                apellido: envio.pedido.usuario.apellido,
                email: envio.pedido.usuario.email,
                telefono: envio.pedido.usuario.telefono,
                localidad: envio.pedido.usuario.localidad
                  ? {
                      id: envio.pedido.usuario.localidad.id,
                      nombre: envio.pedido.usuario.localidad.nombre,
                      provincia: envio.pedido.usuario.localidad.provincia,
                      codigoPostal: envio.pedido.usuario.localidad.codigoPostal,
                    }
                  : undefined,
              }
            : undefined,
        }
      : undefined,
  };
}

export function mapEnvios(envios) {
  return envios.map(mapEnvio);
}
