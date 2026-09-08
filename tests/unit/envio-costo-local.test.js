import { describe, it, expect } from "vitest";
import { envioService, TARIFAS_ENVIO } from "../../src/modules/envios/envio.service.js";

describe("Test 1: Costo de envío en Las Parejas (Unitario)", () => {
  it("debe retornar la tarifa local (3000) para la localidad 'Las Parejas'", () => {
    const costo = envioService.calcularCosto("Las Parejas");
    expect(costo).toBe(TARIFAS_ENVIO.LOCAL);
    expect(costo).toBe(3000);
  });

  it("debe normalizar correctamente mayúsculas y minúsculas", () => {
    expect(envioService.calcularCosto("las parejas")).toBe(3000);
    expect(envioService.calcularCosto("LAS PAREJAS")).toBe(3000);
    expect(envioService.calcularCosto("LaS PaReJaS")).toBe(3000);
  });

  it("debe contemplar espacios adicionales al inicio y al final", () => {
    expect(envioService.calcularCosto("  Las Parejas  ")).toBe(3000);
    expect(envioService.calcularCosto("   las parejas\t")).toBe(3000);
  });
});
