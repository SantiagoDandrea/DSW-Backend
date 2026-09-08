import { describe, it, expect, vi, beforeEach } from "vitest";
import { envioService } from "../../src/modules/envios/envio.service.js";
import { envioRepository } from "../../src/modules/envios/envio.repository.js";
import { pedidoRepository } from "../../src/modules/pedidos/pedido.repository.js";
import { ConflictError } from "../../src/errors/ConflictError.js";
import { ForbiddenError } from "../../src/errors/ForbiddenError.js";

describe("Test 4: Persistencia de CANCELADO del envío (Unitario)", () => {
  const usuarioCliente = { dni: "40111222", rol: "CLIENTE" };
  const usuarioOtroCliente = { dni: "99888777", rol: "CLIENTE" };

  const envioMock = {
    id: 10,
    pedidoId: 20,
    estado: "PENDIENTE",
    costo: 3000,
    domicilioEntrega: "Calle 10 Nro 345, Las Parejas",
    pedido: {
      id: 20,
      usuarioDni: "40111222",
      estado: "PENDIENTE",
      total: 103000,
      detalles: [
        {
          productoId: 3,
          almacenId: 1,
          cantidad: 1,
          precioUnitario: 100000,
        },
      ],
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("debe cancelar el envío, mantener activo el pedido, y descontar el costo del total del pedido", async () => {
    vi.spyOn(envioRepository, "obtenerEnvioPorId").mockResolvedValue(envioMock);
    const cancelarTransaccionalSpy = vi
      .spyOn(envioRepository, "cancelarEnvioTransaccional")
      .mockImplementation(async ({ envioId, pedidoId, nuevoTotal }) => ({
        ...envioMock,
        id: envioId,
        estado: "CANCELADO",
        pedido: {
          ...envioMock.pedido,
          id: pedidoId,
          total: nuevoTotal,
          estado: "PENDIENTE", // El pedido permanece activo
        },
      }));

    // Espiar métodos de stock/cancelación de pedido para comprobar que NO se invoquen
    const cancelarPedidoSpy = vi.spyOn(
      pedidoRepository,
      "cancelarPedidoTransaccional"
    );

    const resultado = await envioService.cancelarEnvio(10, usuarioCliente);

    // 1. El Envío pasa a CANCELADO
    expect(resultado.estado).toBe("CANCELADO");

    // 2. El Pedido permanece activo (no cambia su estado)
    expect(resultado.pedido.estado).toBe("PENDIENTE");

    // 3. El costo del envío se descuenta del total del Pedido (103000 - 3000 = 100000)
    expect(cancelarTransaccionalSpy).toHaveBeenCalledWith({
      envioId: 10,
      pedidoId: 20,
      nuevoTotal: 100000,
    });
    expect(resultado.pedido.total).toBe(100000);

    // 4. El stock NO se devuelve/modifica (no se llama a cancelarPedidoTransaccional)
    expect(cancelarPedidoSpy).not.toHaveBeenCalled();

    // 5. Posteriormente, si el estado del pedido cambia, el envío cancelado no se reactiva
    const siguienteEstadoEnvio = envioService.mapearEstadoPedidoAEnvio(
      "CONFIRMADO",
      resultado.estado
    );
    expect(siguienteEstadoEnvio).toBe("CANCELADO");
  });

  it("debe rechazar la cancelación con ConflictError si el envío ya está CANCELADO", async () => {
    vi.spyOn(envioRepository, "obtenerEnvioPorId").mockResolvedValue({
      ...envioMock,
      estado: "CANCELADO",
    });

    await expect(
      envioService.cancelarEnvio(10, usuarioCliente)
    ).rejects.toThrow(ConflictError);
  });

  it("debe rechazar con ConflictError si el envío ya está EN_TRANSITO o ENTREGADO", async () => {
    vi.spyOn(envioRepository, "obtenerEnvioPorId").mockResolvedValue({
      ...envioMock,
      estado: "EN_TRANSITO",
    });

    await expect(
      envioService.cancelarEnvio(10, usuarioCliente)
    ).rejects.toThrow(ConflictError);
  });

  it("debe rechazar con ForbiddenError si un cliente intenta cancelar el envío de otro usuario", async () => {
    vi.spyOn(envioRepository, "obtenerEnvioPorId").mockResolvedValue(envioMock);

    await expect(
      envioService.cancelarEnvio(10, usuarioOtroCliente)
    ).rejects.toThrow(ForbiddenError);
  });
});
