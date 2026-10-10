import { pedidoRepository } from "./pedido.repository.js";
import { envioService } from "../envios/envio.service.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

const TRANSICIONES_PERMITIDAS = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENVIADO", "CANCELADO"],
  ENVIADO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const ESTADOS_CANCELABLES = ["PENDIENTE", "CONFIRMADO"];

export const pedidoService = {
  async crearPedido({ usuarioAuth, body }) {
    // 1. Determinar el DNI del usuario asociado al pedido
    let usuarioDni = usuarioAuth.dni;
    if (usuarioAuth.rol === "ADMIN" && body.usuarioDni) {
      usuarioDni = body.usuarioDni;
    }

    // 2. Validar que el usuario exista y obtener su localidad para el cálculo de envío
    const usuario = await pedidoRepository.obtenerUsuarioConLocalidad(usuarioDni);
    if (!usuario) {
      throw new NotFoundError(`No existe un usuario con dni ${usuarioDni}.`);
    }

    // 3. Validar que el medio de pago exista
    const medioPago = await pedidoRepository.obtenerMedioPago(body.medioPagoId);
    if (!medioPago) {
      throw new NotFoundError(
        `No existe un medio de pago con id ${body.medioPagoId}.`
      );
    }

    // 4. Procesar productos: validar existencia, precio vigente y stock distribuido
    const detallesDistribuidos = [];

    for (const item of body.productos) {
      const producto = await pedidoRepository.obtenerProducto(item.productoId);
      if (!producto) {
        throw new NotFoundError(
          `No existe un producto con id ${item.productoId}.`
        );
      }

      // Buscar el precio vigente (último precio con fechaDesde <= fecha/hora actual)
      const precioVigente = await pedidoRepository.obtenerPrecioVigente(
        item.productoId
      );
      if (!precioVigente) {
        throw new ConflictError(
          `El producto "${producto.nombre}" (id: ${item.productoId}) no posee un precio vigente.`
        );
      }

      // Consultar stock en todos los almacenes
      const stocks = await pedidoRepository.obtenerStockPorProducto(
        item.productoId
      );
      const stockTotalDisponible = stocks.reduce(
        (acum, s) => acum + s.cantidad,
        0
      );

      if (stockTotalDisponible < item.cantidad) {
        throw new ConflictError(
          `Stock insuficiente para el producto "${producto.nombre}". Disponible total: ${stockTotalDisponible}, solicitado: ${item.cantidad}.`
        );
      }

      // Distribuir la cantidad requerida entre los almacenes disponibles
      let cantidadRestante = item.cantidad;
      for (const regStock of stocks) {
        if (cantidadRestante <= 0) break;
        if (regStock.cantidad <= 0) continue;

        const aDescontar = Math.min(regStock.cantidad, cantidadRestante);
        detallesDistribuidos.push({
          stockId: regStock.id,
          productoId: item.productoId,
          almacenId: regStock.almacenId,
          cantidad: aDescontar,
          precioUnitario: precioVigente.valor,
        });

        cantidadRestante -= aDescontar;
      }
    }

    // 5. Calcular subtotal del pedido
    const subtotal = detallesDistribuidos.reduce(
      (acum, det) => acum + det.cantidad * Number(det.precioUnitario),
      0
    );

    // 6. Determinar costo de envío y preparar datos de envío
    let costoEnvio = 0;
    let datosEnvio = null;

    if (body.envio?.requiereEnvio) {
      costoEnvio = envioService.calcularCosto(usuario.localidad?.nombre);
      datosEnvio = {
        domicilioEntrega: body.envio.domicilioEntrega,
      };
    }

    const total = subtotal + costoEnvio;

    // 7. Ejecutar creación transaccional del pedido y descuento atómico de stock
    try {
      return await pedidoRepository.crearPedidoTransaccional({
        usuarioDni,
        medioPagoId: body.medioPagoId,
        detallesDistribuidos,
        costoEnvio,
        datosEnvio,
        total,
      });
    } catch (err) {
      if (err.message && err.message.startsWith("STOCK_INSUFICIENTE_")) {
        const prodId = err.message.replace("STOCK_INSUFICIENTE_", "");
        throw new ConflictError(
          `Stock insuficiente para completar el pedido (productoId: ${prodId}).`
        );
      }
      throw err;
    }
  },

  async obtenerPedidos(filtros, usuarioAuth) {
    const filtrosAplicados = { ...filtros };

    // Si el usuario es CLIENTE, solo puede ver sus propios pedidos
    if (usuarioAuth.rol !== "ADMIN") {
      filtrosAplicados.usuarioDni = usuarioAuth.dni;
    }

    return pedidoRepository.obtenerPedidos(filtrosAplicados);
  },

  async obtenerPedidoPorId(id, usuarioAuth) {
    const pedido = await pedidoRepository.obtenerPedidoPorId(id);

    if (!pedido) {
      throw new NotFoundError(`No existe un pedido con id ${id}.`);
    }

    // Si el usuario es CLIENTE, no puede consultar pedidos ajenos
    if (usuarioAuth.rol !== "ADMIN" && pedido.usuarioDni !== usuarioAuth.dni) {
      throw new ForbiddenError(
        "No tienes permisos para consultar el detalle de este pedido."
      );
    }

    return pedido;
  },

  async cambiarEstado(id, nuevoEstado, usuarioAuth) {
    const pedido = await pedidoRepository.obtenerPedidoPorId(id);

    if (!pedido) {
      throw new NotFoundError(`No existe un pedido con id ${id}.`);
    }

    if (pedido.estado === nuevoEstado) {
      throw new ConflictError(
        `El pedido ya se encuentra en estado ${nuevoEstado}.`
      );
    }

    const transicionesValidas = TRANSICIONES_PERMITIDAS[pedido.estado] || [];
    if (!transicionesValidas.includes(nuevoEstado)) {
      throw new ConflictError(
        `No se permite la transición de estado de ${pedido.estado} a ${nuevoEstado}.`
      );
    }

    // Si el nuevo estado es CANCELADO, invocar la cancelación con devolución de stock
    if (nuevoEstado === "CANCELADO") {
      return this.cancelarPedido(id, usuarioAuth);
    }

    // Mapear estado de pedido a estado de envío si posee envío
    let nuevoEstadoEnvio = null;
    if (pedido.envio) {
      nuevoEstadoEnvio = envioService.mapearEstadoPedidoAEnvio(
        nuevoEstado,
        pedido.envio.estado
      );
    }

    return pedidoRepository.actualizarEstadoPedido(
      id,
      nuevoEstado,
      nuevoEstadoEnvio
    );
  },

  async cancelarPedido(id, usuarioAuth) {
    const pedido = await pedidoRepository.obtenerPedidoPorId(id);

    if (!pedido) {
      throw new NotFoundError(`No existe un pedido con id ${id}.`);
    }

    // Si es CLIENTE, solo puede cancelar sus propios pedidos
    if (usuarioAuth.rol !== "ADMIN" && pedido.usuarioDni !== usuarioAuth.dni) {
      throw new ForbiddenError(
        "No tienes permisos para cancelar este pedido."
      );
    }

    if (pedido.estado === "CANCELADO") {
      throw new ConflictError("El pedido ya se encuentra cancelado.");
    }

    if (!ESTADOS_CANCELABLES.includes(pedido.estado)) {
      throw new ConflictError(
        `No se puede cancelar un pedido en estado ${pedido.estado}.`
      );
    }

    // Devolver exactamente el stock a los almacenes de donde fue descontado
    return pedidoRepository.cancelarPedidoTransaccional(
      id,
      pedido.detalles
    );
  },

  async actualizarPedido(id, data, usuarioAuth) {
    const pedido = await pedidoRepository.obtenerPedidoPorId(id);

    if (!pedido) {
      throw new NotFoundError(`No existe un pedido con id ${id}.`);
    }

    if (pedido.estado !== "PENDIENTE") {
      throw new ConflictError(
        `Solo se pueden modificar pedidos en estado PENDIENTE (estado actual: ${pedido.estado}).`
      );
    }

    if (data.medioPagoId !== undefined) {
      const medioPago = await pedidoRepository.obtenerMedioPago(
        data.medioPagoId
      );
      if (!medioPago) {
        throw new NotFoundError(
          `No existe un medio de pago con id ${data.medioPagoId}.`
        );
      }
    }

    if (data.domicilioEntrega !== undefined) {
      if (!pedido.envio) {
        throw new ConflictError(
          "No se puede actualizar el domicilio de entrega de un pedido sin envío."
        );
      }

      if (pedido.envio.estado === "CANCELADO") {
        throw new ConflictError(
          "No se puede actualizar el domicilio de entrega de un envío cancelado."
        );
      }
    }

    return pedidoRepository.actualizarPedido(id, data);
  },

  async eliminarPedido(id, usuarioAuth) {
    const pedido = await pedidoRepository.obtenerPedidoPorId(id);

    if (!pedido) {
      throw new NotFoundError(`No existe un pedido con id ${id}.`);
    }

    if (pedido.estado !== "CANCELADO") {
      throw new ConflictError(
        `Solo se pueden eliminar pedidos en estado CANCELADO para proteger la integridad histórica y del stock (estado actual: ${pedido.estado}).`
      );
    }

    await pedidoRepository.eliminarPedido(id);
  },
};
