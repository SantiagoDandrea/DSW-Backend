import { describe, it, expect } from "vitest";
import { envioService, TARIFAS_ENVIO } from "../../src/modules/envios/envio.service.js";

describe("Test 2: Costo de envío fuera de Las Parejas (Unitario)", () => {
  it("debe retornar la tarifa nacional (15000) para la localidad representativa 'Rosario'", () => {
    const costo = envioService.calcularCosto("Rosario");
    expect(costo).toBe(TARIFAS_ENVIO.NACIONAL);
    expect(costo).toBe(15000);
  });

  it("debe aplicar la tarifa nacional para otras localidades fuera de Las Parejas", () => {
    expect(envioService.calcularCosto("Córdoba")).toBe(15000);
    expect(envioService.calcularCosto("Buenos Aires")).toBe(15000);
    expect(envioService.calcularCosto("Santa Fe")).toBe(15000);
  });

  it("debe aplicar la tarifa nacional por defecto ante valores nulos, vacíos o tipos no válidos", () => {
    expect(envioService.calcularCosto("")).toBe(15000);
    expect(envioService.calcularCosto(null)).toBe(15000);
    expect(envioService.calcularCosto(undefined)).toBe(15000);
    expect(envioService.calcularCosto(123)).toBe(15000);
  });
});
