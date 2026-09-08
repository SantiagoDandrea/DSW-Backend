import { describe, it, expect } from "vitest";
import { envioService } from "../../src/modules/envios/envio.service.js";

describe("Test 3: Mapeo de estados Pedido -> Envío (Unitario)", () => {
  it("debe mapear los estados iniciales e intermedios del pedido a PENDIENTE en el envío", () => {
    expect(envioService.mapearEstadoPedidoAEnvio("PENDIENTE", "PENDIENTE")).toBe("PENDIENTE");
    expect(envioService.mapearEstadoPedidoAEnvio("CONFIRMADO", "PENDIENTE")).toBe("PENDIENTE");
    expect(envioService.mapearEstadoPedidoAEnvio("EN_PREPARACION", "PENDIENTE")).toBe("PENDIENTE");
  });

  it("debe mapear el estado ENVIADO del pedido a EN_TRANSITO en el envío", () => {
    expect(envioService.mapearEstadoPedidoAEnvio("ENVIADO", "PENDIENTE")).toBe("EN_TRANSITO");
  });

  it("debe mapear el estado ENTREGADO del pedido a ENTREGADO en el envío", () => {
    expect(envioService.mapearEstadoPedidoAEnvio("ENTREGADO", "EN_TRANSITO")).toBe("ENTREGADO");
  });

  it("debe mapear el estado CANCELADO del pedido a CANCELADO en el envío", () => {
    expect(envioService.mapearEstadoPedidoAEnvio("CANCELADO", "PENDIENTE")).toBe("CANCELADO");
  });

  it("regla especial: si el envío ya está CANCELADO, no debe reactivarse ante cambios de estado del pedido", () => {
    const estadosPedido = ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO"];

    for (const estado of estadosPedido) {
      const resultado = envioService.mapearEstadoPedidoAEnvio(estado, "CANCELADO");
      expect(resultado).toBe("CANCELADO");
    }
  });
});
