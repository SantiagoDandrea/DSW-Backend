import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { TARIFAS_ENVIO } from "../../src/modules/envios/envio.service.js";

describe("Test 5: Integración HTTP — Crear pedido + envío + total + stock", () => {
  // Identificadores y referencias creadas para el test autónomo
  const timestamp = Date.now();
  const passwordPlano = "Password123";

  let tokenCliente;
  let usuarioDniCreado = null;
  let categoriaCreadaId = null;
  let marcaCreadaId = null;
  let proveedorCreadaId = null;
  let localidadCreadaId = null;
  let productoCreadoId = null;
  let precioCreadoId = null;
  let medioPagoCreadoId = null;
  let almacenCreadoId = null;
  let stockCreadoId = null;
  let pedidoCreadoId = null;

  // Valores de negocio fijados para el escenario de prueba
  let stockInicialCantidad = 10;
  let precioUnitarioProducto = 50000;
  const cantidadAComprar = 2;

  beforeAll(async () => {
    // 1. Localidad: reutilizar "Las Parejas" si existe o crearla de forma compatible
    let localidad = await prisma.localidad.findFirst({
      where: { nombre: { equals: "Las Parejas" } },
    });
    if (!localidad) {
      localidad = await prisma.localidad.create({
        data: {
          nombre: "Las Parejas",
          codigoPostal: `25${String(timestamp).slice(-2)}`,
          provincia: "Santa Fe",
        },
      });
      localidadCreadaId = localidad.id;
    }

    // 2. Usuario CLIENTE autónomo con DNI y email únicos
    usuarioDniCreado = String(Math.floor(10000000 + Math.random() * 90000000));
    const usuarioEmail = `test.integration.${timestamp}@example.com`;
    const hashedPassword = await bcrypt.hash(passwordPlano, 10);

    await prisma.usuario.create({
      data: {
        dni: usuarioDniCreado,
        nombre: "Test",
        apellido: "Integration",
        email: usuarioEmail,
        password: hashedPassword,
        telefono: "3471000000",
        rol: "CLIENTE",
        localidadId: localidad.id,
      },
    });

    // 3. Entidades accesorias para producto (reutilizar existentes o crear de prueba)
    let categoria = await prisma.categoria.findFirst();
    if (!categoria) {
      categoria = await prisma.categoria.create({
        data: { nombre: `Cat Test ${timestamp}` },
      });
      categoriaCreadaId = categoria.id;
    }

    let marca = await prisma.marca.findFirst();
    if (!marca) {
      marca = await prisma.marca.create({
        data: { nombre: `Marca Test ${timestamp}` },
      });
      marcaCreadaId = marca.id;
    }

    let proveedor = await prisma.proveedor.findFirst();
    if (!proveedor) {
      proveedor = await prisma.proveedor.create({
        data: {
          nombre: `Prov Test ${timestamp}`,
          cuit: `20${String(timestamp).slice(-8)}9`,
          telefono: "3471112233",
        },
      });
      proveedorCreadaId = proveedor.id;
    }

    // 4. Producto autónomo
    const producto = await prisma.producto.create({
      data: {
        nombre: `Producto Test ${timestamp}`,
        descripcion: "Producto autónomo creado para prueba de integración",
        categoriaId: categoria.id,
        marcaId: marca.id,
        proveedorId: proveedor.id,
      },
    });
    productoCreadoId = producto.id;

    // 5. Precio vigente para el producto
    const precio = await prisma.precio.create({
      data: {
        productoId: producto.id,
        valor: precioUnitarioProducto,
        fechaDesde: new Date(Date.now() - 60000), // Vigente desde hace 1 minuto
      },
    });
    precioCreadoId = precio.id;

    // 6. Medio de pago (reutilizar existente o crear uno)
    let medioPago = await prisma.medioPago.findFirst();
    if (!medioPago) {
      medioPago = await prisma.medioPago.create({
        data: { descripcion: `Medio Pago Test ${timestamp}` },
      });
      medioPagoCreadoId = medioPago.id;
    }

    // 7. Almacén exclusivo para la prueba
    const almacen = await prisma.almacen.create({
      data: {
        descripcion: `Almacén Test ${timestamp}`,
        direccion: "Calle Almacén Test 123",
      },
    });
    almacenCreadoId = almacen.id;

    // 8. Stock exclusivo y suficiente para el producto en el almacén
    const stock = await prisma.stock.create({
      data: {
        productoId: producto.id,
        almacenId: almacen.id,
        cantidad: stockInicialCantidad,
      },
    });
    stockCreadoId = stock.id;

    // 9. Login HTTP para obtener token real del usuario CLIENTE creado
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: usuarioEmail,
        password: passwordPlano,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    tokenCliente = loginRes.body.token;
  });

  afterAll(async () => {
    // Limpieza en orden inverso a las relaciones de claves foráneas
    try {
      if (pedidoCreadoId) {
        // Envio y DetallePedido se eliminan en cascada junto con Pedido
        await prisma.pedido.delete({ where: { id: pedidoCreadoId } }).catch(() => {});
      }

      if (stockCreadoId) {
        await prisma.stock.delete({ where: { id: stockCreadoId } }).catch(() => {});
      }

      if (precioCreadoId) {
        await prisma.precio.delete({ where: { id: precioCreadoId } }).catch(() => {});
      }

      if (productoCreadoId) {
        await prisma.producto.delete({ where: { id: productoCreadoId } }).catch(() => {});
      }

      if (almacenCreadoId) {
        await prisma.almacen.delete({ where: { id: almacenCreadoId } }).catch(() => {});
      }

      if (usuarioDniCreado) {
        await prisma.usuario.delete({ where: { dni: usuarioDniCreado } }).catch(() => {});
      }

      if (medioPagoCreadoId) {
        await prisma.medioPago.delete({ where: { id: medioPagoCreadoId } }).catch(() => {});
      }

      if (proveedorCreadaId) {
        await prisma.proveedor.delete({ where: { id: proveedorCreadaId } }).catch(() => {});
      }

      if (marcaCreadaId) {
        await prisma.marca.delete({ where: { id: marcaCreadaId } }).catch(() => {});
      }

      if (categoriaCreadaId) {
        await prisma.categoria.delete({ where: { id: categoriaCreadaId } }).catch(() => {});
      }

      if (localidadCreadaId) {
        await prisma.localidad.delete({ where: { id: localidadCreadaId } }).catch(() => {});
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it("debe crear el pedido vía HTTP, generar el envío, calcular el costo y total, y descontar el stock", async () => {
    const medioPago = await prisma.medioPago.findFirst();
    const subtotalEsperado = precioUnitarioProducto * cantidadAComprar;
    const costoEnvioEsperado = TARIFAS_ENVIO.LOCAL; // Localidad Las Parejas = 3000
    const totalEsperado = subtotalEsperado + costoEnvioEsperado;
    const domicilioEntregaEsperado = "Calle 20 numero 340, Las Parejas";

    const pedidoPayload = {
      productos: [
        {
          productoId: productoCreadoId,
          cantidad: cantidadAComprar,
        },
      ],
      medioPagoId: medioPago.id,
      envio: {
        requiereEnvio: true,
        domicilioEntrega: domicilioEntregaEsperado,
      },
    };

    // 1. Petición HTTP real atravesando todas las capas del backend
    const res = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send(pedidoPayload);

    // Verificación 1: Respuesta 201 Created y estructura presente
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.id).toBeDefined();

    pedidoCreadoId = res.body.id;

    // Verificación 2: El Pedido fue creado en estado PENDIENTE
    expect(res.body.estado).toBe("PENDIENTE");

    // Verificación 3: Se creó el Envío asociado cuando se requiere envío
    expect(res.body.envio).toBeDefined();
    expect(res.body.envio).not.toBeNull();

    // Verificación 4: El Envío quedó en estado PENDIENTE y con el domicilio enviado
    expect(res.body.envio.estado).toBe("PENDIENTE");
    expect(res.body.envio.domicilioEntrega).toBe(domicilioEntregaEsperado);

    // Verificación 5: El costo del envío corresponde a la tarifa local calculada
    expect(res.body.envio.costo).toBe(costoEnvioEsperado);

    // Verificación 6: Pedido.total corresponde exactamente a subtotal + costoEnvio
    expect(res.body.total).toBe(totalEsperado);

    // Verificación 7: Comprobar directamente en la BD que el stock disminuyó en la cantidad comprada
    const stockActualizado = await prisma.stock.findUnique({
      where: { id: stockCreadoId },
    });
    expect(stockActualizado.cantidad).toBe(stockInicialCantidad - cantidadAComprar);

    // Verificación 8: Comprobar la persistencia completa del pedido y sus relaciones en la base de datos
    const pedidoEnDb = await prisma.pedido.findUnique({
      where: { id: pedidoCreadoId },
      include: { envio: true, detalles: true },
    });
    expect(pedidoEnDb).not.toBeNull();
    expect(pedidoEnDb.usuarioDni).toBe(usuarioDniCreado);
    expect(pedidoEnDb.estado).toBe("PENDIENTE");
    expect(Number(pedidoEnDb.total)).toBe(totalEsperado);
    expect(pedidoEnDb.envio).not.toBeNull();
    expect(pedidoEnDb.envio.estado).toBe("PENDIENTE");
    expect(Number(pedidoEnDb.envio.costo)).toBe(costoEnvioEsperado);
    expect(pedidoEnDb.envio.domicilioEntrega).toBe(domicilioEntregaEsperado);
    expect(pedidoEnDb.detalles.length).toBe(1);
    expect(pedidoEnDb.detalles[0].productoId).toBe(productoCreadoId);
    expect(pedidoEnDb.detalles[0].cantidad).toBe(cantidadAComprar);
    expect(Number(pedidoEnDb.detalles[0].precioUnitario)).toBe(precioUnitarioProducto);
  });
});
