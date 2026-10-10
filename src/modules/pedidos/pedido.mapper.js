function agruparDetallesPorProducto(detalles) {
  if (!Array.isArray(detalles)) return [];

  const mapa = new Map();

  for (const detalle of detalles) {
    const prodId = detalle.productoId;
    const precioUnitario = Number(detalle.precioUnitario);
    const subtotal = detalle.cantidad * precioUnitario;

    if (!mapa.has(prodId)) {
      mapa.set(prodId, {
        id: detalle.id,
        productoId: prodId,
        producto: detalle.producto
          ? {
              id: detalle.producto.id,
              nombre: detalle.producto.nombre,
              descripcion: detalle.producto.descripcion,
            }
          : undefined,
        almacenId: detalle.almacenId,
        almacen: detalle.almacen
          ? {
              id: detalle.almacen.id,
              descripcion: detalle.almacen.descripcion,
              direccion: detalle.almacen.direccion,
            }
          : undefined,
        cantidad: detalle.cantidad,
        precioUnitario,
        subtotal,
      });
    } else {
      const itemExistente = mapa.get(prodId);
      itemExistente.cantidad += detalle.cantidad;
      itemExistente.subtotal += subtotal;
    }
  }

  return Array.from(mapa.values());
}

export function mapPedido(pedido) {
  if (!pedido) return null;

  return {
    id: pedido.id,
    fecha: pedido.fecha,
    estado: pedido.estado,
    total: Number(pedido.total),
    cliente: pedido.usuario
      ? {
          dni: pedido.usuario.dni,
          nombre: pedido.usuario.nombre,
          apellido: pedido.usuario.apellido,
          email: pedido.usuario.email,
          telefono: pedido.usuario.telefono,
          localidad: pedido.usuario.localidad
            ? {
                id: pedido.usuario.localidad.id,
                nombre: pedido.usuario.localidad.nombre,
                provincia: pedido.usuario.localidad.provincia,
                codigoPostal: pedido.usuario.localidad.codigoPostal,
              }
            : undefined,
        }
      : undefined,
    medioPago: pedido.medioPago
      ? {
          id: pedido.medioPago.id,
          descripcion: pedido.medioPago.descripcion,
        }
      : undefined,
    detalles: agruparDetallesPorProducto(pedido.detalles),
    envio: pedido.envio
      ? {
          id: pedido.envio.id,
          domicilioEntrega: pedido.envio.domicilioEntrega,
          costo: Number(pedido.envio.costo),
          fechaTentativa: pedido.envio.fechaTentativa,
          fechaEntregado: pedido.envio.fechaEntregado,
          estado: pedido.envio.estado,
        }
      : null,
  };
}

export function mapPedidos(pedidos) {
  return pedidos.map((pedido) => ({
    id: pedido.id,
    fecha: pedido.fecha,
    estado: pedido.estado,
    total: Number(pedido.total),
    cliente: pedido.usuario
      ? {
          dni: pedido.usuario.dni,
          nombre: pedido.usuario.nombre,
          apellido: pedido.usuario.apellido,
          email: pedido.usuario.email,
        }
      : undefined,
    medioPago: pedido.medioPago
      ? {
          id: pedido.medioPago.id,
          descripcion: pedido.medioPago.descripcion,
        }
      : undefined,
    envio: pedido.envio
      ? {
          id: pedido.envio.id,
          domicilioEntrega: pedido.envio.domicilioEntrega,
          costo: Number(pedido.envio.costo),
          estado: pedido.envio.estado,
        }
      : null,
  }));
}
