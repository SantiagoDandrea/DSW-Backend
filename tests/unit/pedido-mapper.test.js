import { describe, it, expect } from "vitest";
import { mapPedido } from "../../src/modules/pedidos/pedido.mapper.js";

describe("pedido.mapper - agruparDetallesPorProducto", () => {
  it("debe consolidar múltiples detalles del mismo producto provenientes de distintos almacenes en una única fila", () => {
    const pedidoConVariosAlmacenes = {
      id: 101,
      fecha: new Date(),
      estado: "PENDIENTE",
      total: "4750000.00",
      usuario: {
        dni: "12345678",
        nombre: "Juan",
        apellido: "Pérez",
        email: "juan@example.com",
      },
      detalles: [
        {
          id: 1,
          productoId: 42,
          producto: { id: 42, nombre: "Notebook HP 15 Ryzen 5", descripcion: "Portátil" },
          almacenId: 1,
          almacen: { id: 1, descripcion: "Almacén Central" },
          cantidad: 3,
          precioUnitario: "950000.00",
        },
        {
          id: 2,
          productoId: 42,
          producto: { id: 42, nombre: "Notebook HP 15 Ryzen 5", descripcion: "Portátil" },
          almacenId: 2,
          almacen: { id: 2, descripcion: "Almacén Sucursal" },
          cantidad: 2,
          precioUnitario: "950000.00",
        },
      ],
      envio: null,
    };

    const mapeado = mapPedido(pedidoConVariosAlmacenes);

    expect(mapeado.detalles).toHaveLength(1);
    expect(mapeado.detalles[0].productoId).toBe(42);
    expect(mapeado.detalles[0].producto.nombre).toBe("Notebook HP 15 Ryzen 5");
    expect(mapeado.detalles[0].cantidad).toBe(5);
    expect(mapeado.detalles[0].precioUnitario).toBe(950000);
    expect(mapeado.detalles[0].subtotal).toBe(4750000);
  });

  it("debe mantener productos distintos separados al agrupar", () => {
    const pedidoConVariosProductos = {
      id: 102,
      fecha: new Date(),
      estado: "CONFIRMADO",
      total: "100000.00",
      detalles: [
        {
          id: 1,
          productoId: 10,
          producto: { id: 10, nombre: "Mouse USB" },
          cantidad: 2,
          precioUnitario: "15000.00",
        },
        {
          id: 2,
          productoId: 10,
          producto: { id: 10, nombre: "Mouse USB" },
          cantidad: 1,
          precioUnitario: "15000.00",
        },
        {
          id: 3,
          productoId: 20,
          producto: { id: 20, nombre: "Teclado Mecánico" },
          cantidad: 1,
          precioUnitario: "55000.00",
        },
      ],
    };

    const mapeado = mapPedido(pedidoConVariosProductos);

    expect(mapeado.detalles).toHaveLength(2);

    const mouse = mapeado.detalles.find((d) => d.productoId === 10);
    expect(mouse).toBeDefined();
    expect(mouse.cantidad).toBe(3);
    expect(mouse.subtotal).toBe(45000);

    const teclado = mapeado.detalles.find((d) => d.productoId === 20);
    expect(teclado).toBeDefined();
    expect(teclado.cantidad).toBe(1);
    expect(teclado.subtotal).toBe(55000);
  });
});
