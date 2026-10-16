import bcrypt from "bcryptjs";
import { prisma } from "../src/config/database.js";

const PASSWORD = "Password123";

async function main() {
  console.log("Limpiando datos existentes en la base de datos...");
  await prisma.envio.deleteMany();
  await prisma.detallePedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.imagenProducto.deleteMany();
  await prisma.precio.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.almacen.deleteMany();
  await prisma.medioPago.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.localidad.deleteMany();

  console.log("Cargando nuevos datos de prueba...");
  const passHash = await bcrypt.hash(PASSWORD, 10);

  const [lasParejas, rosario, caseros, cordoba] = await Promise.all([
    prisma.localidad.create({ data: { nombre: "Las Parejas", codigoPostal: "2505", provincia: "Santa Fe" } }),
    prisma.localidad.create({ data: { nombre: "Rosario", codigoPostal: "2000", provincia: "Santa Fe" } }),
    prisma.localidad.create({ data: { nombre: "Caseros", codigoPostal: "1678", provincia: "Buenos Aires" } }),
    prisma.localidad.create({ data: { nombre: "Córdoba", codigoPostal: "5000", provincia: "Córdoba" } }),
  ]);

  const admin = await prisma.usuario.create({
    data: {
      dni: "10000001", nombre: "Admin", apellido: "Principal", email: "admin@demo.com",
      password: passHash, telefono: "3471000001", rol: "ADMIN", localidadId: lasParejas.id,
    },
  });

  const [cliente1, cliente2, cliente3] = await Promise.all([
    prisma.usuario.create({ data: { dni: "20000001", nombre: "Carlos", apellido: "Perez", email: "carlos@demo.com", password: passHash, telefono: "3471000002", rol: "CLIENTE", localidadId: lasParejas.id } }),
    prisma.usuario.create({ data: { dni: "20000002", nombre: "Ana", apellido: "Gomez", email: "ana@demo.com", password: passHash, telefono: "3411000003", rol: "CLIENTE", localidadId: rosario.id } }),
    prisma.usuario.create({ data: { dni: "20000003", nombre: "Lucas", apellido: "Diaz", email: "lucas@demo.com", password: passHash, telefono: "1141000004", rol: "CLIENTE", localidadId: caseros.id } }),
  ]);

  const [colchones, tecnologia, electro] = await Promise.all([
    prisma.categoria.create({ data: { nombre: "Colchones" } }),
    prisma.categoria.create({ data: { nombre: "Tecnología" } }),
    prisma.categoria.create({ data: { nombre: "Electrodomésticos" } }),
  ]);

  const [piero, sealy, samsung, hp, whirlpool, philips] = await Promise.all([
    prisma.marca.create({ data: { nombre: "Piero" } }),
    prisma.marca.create({ data: { nombre: "Sealy" } }),
    prisma.marca.create({ data: { nombre: "Samsung" } }),
    prisma.marca.create({ data: { nombre: "HP" } }),
    prisma.marca.create({ data: { nombre: "Whirlpool" } }),
    prisma.marca.create({ data: { nombre: "Philips" } }),
  ]);

  const [proveedor1, proveedor2, proveedor3] = await Promise.all([
    prisma.proveedor.create({ data: { nombre: "Distribuidora Central SRL", cuit: "30111111116", telefono: "3471222222" } }),
    prisma.proveedor.create({ data: { nombre: "TecnoImport SA", cuit: "30222222227", telefono: "3411333333" } }),
    prisma.proveedor.create({ data: { nombre: "Hogar Mayorista", cuit: "30333333338", telefono: "1144444444" } }),
  ]);

  const [transferencia, tarjeta, efectivo] = await Promise.all([
    prisma.medioPago.create({ data: { descripcion: "Transferencia Bancaria" } }),
    prisma.medioPago.create({ data: { descripcion: "Tarjeta de Crédito" } }),
    prisma.medioPago.create({ data: { descripcion: "Efectivo" } }),
  ]);

  const [local, deposito] = await Promise.all([
    prisma.almacen.create({ data: { descripcion: "Local Físico Central", direccion: "Calle 20 Nro 500, Las Parejas" } }),
    prisma.almacen.create({ data: { descripcion: "Depósito Industrial", direccion: "Ruta 178 Km 2, Las Parejas" } }),
  ]);

  const productosData = [
    { nombre: "Colchón Piero Dream 2 Plazas", descripcion: "Resortes pocket, doble faz verano/invierno", categoriaId: colchones.id, marcaId: piero.id, proveedorId: proveedor1.id, precio: 185000, imagen: "https://scc.piero.com.ar/medias/c515Wx515H-mattina0786-col.jpg?context=bWFzdGVyfGltYWdlc3w0MzExNXxpbWFnZS9qcGVnfGFEZGhMMmc1WkM4eE1UazJNalU0T1RrM01EUTJNaTlqTlRFMVYzZzFNVFZJWDIxaGRIUnBibUV3TnpnMklHTnZiQzVxY0djfDAxNjdlYjczZGQ2MTAxYzdjYThiOTJkMDhhMjY2YjdhOTlmZWVhNmJjMzkwYWIwOWM5OGY5ODI1NmM4OTY1Nzg", stockLocal: 4, stockDeposito: 6 },
    { nombre: "Colchón Sealy Firme 1 Plaza", descripcion: "Espuma alta densidad, soporte firme", categoriaId: colchones.id, marcaId: sealy.id, proveedorId: proveedor1.id, precio: 95000, imagen: "https://images.fravega.com/f500/1d75f6fa2a153a2b83ccb2b727714982.jpg", stockLocal: 2, stockDeposito: 0 },
    { nombre: "Almohada Piero Viscoelástica", descripcion: "Viscoelástica con funda desmontable", categoriaId: colchones.id, marcaId: piero.id, proveedorId: proveedor1.id, precio: 22000, imagen: "https://www.dormilindo.com/wp-content/uploads/2021/06/17-Almohada-Piero-Dream-Tech-Viscoelastica-Gris-C.jpg", stockLocal: 10, stockDeposito: 15 },
    { nombre: "Notebook HP 15 Ryzen 5", descripcion: "8GB RAM, 512GB SSD, Windows 11", categoriaId: tecnologia.id, marcaId: hp.id, proveedorId: proveedor2.id, precio: 950000, imagen: "https://ar-media.hptiendaenlinea.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/B/3/B31WFLA-1_T1745430920.png", stockLocal: 3, stockDeposito: 2 },
    { nombre: "Smart TV Samsung 50\" 4K", descripcion: "UHD, Tizen OS, HDR10+", categoriaId: tecnologia.id, marcaId: samsung.id, proveedorId: proveedor2.id, precio: 620000, imagen: "https://images.fravega.com/f1000/7f5361a66917eb266870f62a3c414a6a.jpg", stockLocal: 5, stockDeposito: 5 },
    { nombre: "Celular Samsung Galaxy A55", descripcion: "128GB, 8GB RAM, cámara triple", categoriaId: tecnologia.id, marcaId: samsung.id, proveedorId: proveedor2.id, precio: 480000, imagen: "https://img.global.news.samsung.com/ar/wp-content/uploads/2024/03/001-galaxy-a55-5g-awesomeiceblue-front.jpg", stockLocal: 0, stockDeposito: 0 },
    { nombre: "Auriculares Philips Bluetooth", descripcion: "Cancelación de ruido, 30hs batería", categoriaId: tecnologia.id, marcaId: philips.id, proveedorId: proveedor2.id, precio: 65000, imagen: "https://www.cordobadigital.net/wp-content/uploads/2022/12/16302.jpg", stockLocal: 8, stockDeposito: 12 },
    { nombre: "Heladera Whirlpool No Frost 350L", descripcion: "Dispenser de agua, eficiencia A+", categoriaId: electro.id, marcaId: whirlpool.id, proveedorId: proveedor3.id, precio: 890000, imagen: "https://images.fravega.com/f1000/83c4fdf19880d19f59d01ad112d25d58.jpg", stockLocal: 2, stockDeposito: 3 },
    { nombre: "Lavarropas Whirlpool 8kg", descripcion: "Carga frontal, 1200rpm", categoriaId: electro.id, marcaId: whirlpool.id, proveedorId: proveedor3.id, precio: 540000, imagen: "https://whirlpoolargio.vtexassets.com/arquivos/ids/171323/WNQ80AB.png?v=639262212353530000", stockLocal: 1, stockDeposito: 4 },
    { nombre: "Microondas Philco 20L", descripcion: "Grill, panel digital", categoriaId: electro.id, marcaId: philips.id, proveedorId: proveedor3.id, precio: 145000, imagen: "https://authogar.vtexassets.com/arquivos/ids/268824-800-auto?v=638991723345200000&width=800&height=auto&aspect=true", stockLocal: 6, stockDeposito: 6 },
    { nombre: "Aspiradora Philips PowerPro", descripcion: "1900W, sin bolsa", categoriaId: electro.id, marcaId: philips.id, proveedorId: proveedor3.id, precio: 130000, imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY6-lEedA0HRXyZiPrdC2G3jEc1p3wSUzbmdwrhmDYBJEM5d2jN-SApEA_&s=10", stockLocal: 0, stockDeposito: 3 },
    { nombre: "Cafetera Philips Espresso", descripcion: "Molinillo integrado, 15 bares", categoriaId: electro.id, marcaId: philips.id, proveedorId: proveedor3.id, precio: 210000, imagen: "https://lamutualdeamr.org.ar/lamedica/LMVProductosImagenes/14097_30798.jpg", stockLocal: 3, stockDeposito: 1 },
  ];

  const productos = [];
  for (const p of productosData) {
    const producto = await prisma.producto.create({
      data: { nombre: p.nombre, descripcion: p.descripcion, categoriaId: p.categoriaId, marcaId: p.marcaId, proveedorId: p.proveedorId },
    });

    await prisma.precio.create({
      data: { productoId: producto.id, valor: p.precio, fechaDesde: new Date(Date.now() - 30 * 86400000) },
    });

    await prisma.imagenProducto.create({
      data: { productoId: producto.id, url: p.imagen, orden: 0 },
    });

    await prisma.stock.create({ data: { productoId: producto.id, almacenId: local.id, cantidad: p.stockLocal } });
    await prisma.stock.create({ data: { productoId: producto.id, almacenId: deposito.id, cantidad: p.stockDeposito } });

    productos.push(producto);
  }

  // Producto con historial de precios (para demostrar el modelo)
  const productoConHistorial = productos[3]; // Notebook HP
  await prisma.precio.create({
    data: { productoId: productoConHistorial.id, valor: 890000, fechaDesde: new Date(Date.now() - 90 * 86400000) },
  });

  // Pedido 1: entregado, con envío (Las Parejas -> costo local)
  const pedido1 = await prisma.pedido.create({
    data: {
      usuarioDni: cliente1.dni,
      medioPagoId: transferencia.id,
      estado: "ENTREGADO",
      total: 185000 + 22000 + 3000,
      detalles: {
        create: [
          { productoId: productos[0].id, almacenId: local.id, cantidad: 1, precioUnitario: 185000 },
          { productoId: productos[2].id, almacenId: local.id, cantidad: 1, precioUnitario: 22000 },
        ],
      },
    },
  });
  await prisma.envio.create({
    data: {
      pedidoId: pedido1.id, domicilioEntrega: "Calle 15 Nro 220, Las Parejas",
      costo: 3000, estado: "ENTREGADO", fechaEntregado: new Date(Date.now() - 5 * 86400000),
    },
  });

  // Pedido 2: pendiente, con envío (Rosario -> costo nacional)
  const pedido2 = await prisma.pedido.create({
    data: {
      usuarioDni: cliente2.dni,
      medioPagoId: tarjeta.id,
      estado: "PENDIENTE",
      total: 65000 + 15000,
      detalles: { create: [{ productoId: productos[6].id, almacenId: deposito.id, cantidad: 1, precioUnitario: 65000 }] },
    },
  });
  await prisma.envio.create({
    data: { pedidoId: pedido2.id, domicilioEntrega: "Bv. Oroño 1200, Rosario", costo: 15000, estado: "PENDIENTE" },
  });

  // Pedido 3: confirmado, retiro en local (sin envío)
  await prisma.pedido.create({
    data: {
      usuarioDni: cliente3.dni,
      medioPagoId: efectivo.id,
      estado: "CONFIRMADO",
      total: 145000,
      detalles: { create: [{ productoId: productos[9].id, almacenId: local.id, cantidad: 1, precioUnitario: 145000 }] },
    },
  });

  console.log("Seed completo.");
  console.log("");
  console.log("Localidades:", { lasParejas: lasParejas.id, rosario: rosario.id, caseros: caseros.id, cordoba: cordoba.id });
  console.log("Productos creados:", productos.length);
  console.log("");
  console.log("Usuarios (password para todos: " + PASSWORD + "):");
  console.log("  ADMIN:   admin@demo.com  (dni " + admin.dni + ")");
  console.log("  CLIENTE: carlos@demo.com (dni " + cliente1.dni + ", Las Parejas)");
  console.log("  CLIENTE: ana@demo.com    (dni " + cliente2.dni + ", Rosario)");
  console.log("  CLIENTE: lucas@demo.com  (dni " + cliente3.dni + ", Caseros)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
