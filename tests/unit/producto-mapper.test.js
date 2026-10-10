import { describe, it, expect } from "vitest";
import { mapProducto } from "../../src/modules/productos/producto.mapper.js";

describe("producto.mapper", () => {
  it("debe calcular stockDisponible y tolerar proveedor null", () => {
    const mockProducto = {
      id: 1,
      nombre: "Taladro Percutor",
      descripcion: "Herramienta",
      categoria: { id: 10, nombre: "Herramientas" },
      marca: { id: 20, nombre: "DeWalt" },
      proveedor: null,
      precios: [{ valor: "15000.50" }],
      stock: [{ cantidad: 5 }, { cantidad: 3 }],
      imagenes: [],
    };

    const mapeado = mapProducto(mockProducto);

    expect(mapeado.id).toBe(1);
    expect(mapeado.disponible).toBe(true);
    expect(mapeado.stockDisponible).toBe(8);
    expect(mapeado.proveedor).toBeNull();
    expect(mapeado.precioActual).toBe(15000.5);
  });

  it("debe retornar stockDisponible 0 y disponible false cuando no hay stock", () => {
    const mockProducto = {
      id: 2,
      nombre: "Amoladora",
      descripcion: "Herramienta",
      categoria: { id: 10, nombre: "Herramientas" },
      marca: { id: 20, nombre: "Bosch" },
      proveedor: { id: 5, nombre: "Ferretería Central" },
      precios: [{ valor: "20000" }],
      stock: [{ cantidad: 0 }],
      imagenes: [],
    };

    const mapeado = mapProducto(mockProducto);

    expect(mapeado.disponible).toBe(false);
    expect(mapeado.stockDisponible).toBe(0);
    expect(mapeado.proveedor).toEqual({ id: 5, nombre: "Ferretería Central" });
  });
});
