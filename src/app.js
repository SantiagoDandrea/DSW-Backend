import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/index.js";
import categoriasRouter from "./modules/categorias/index.js";
import marcasRouter from "./modules/marcas/index.js";
import mediosPagoRouter from "./modules/medios-pago/index.js";
import localidadesRouter from "./modules/localidades/index.js";
import proveedoresRouter from "./modules/proveedores/index.js";
import productosRouter from "./modules/productos/index.js";
import almacenRouter from "./modules/almacenes/index.js";
import usuariosRouter from "./modules/usuarios/index.js";
import stockRouter from "./modules/stock/index.js";
import precioRouter, { historialPrecioRouter } from "./modules/precios/index.js";
import pedidosRouter from "./modules/pedidos/index.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/marcas", marcasRouter);
app.use("/api/medios-pago", mediosPagoRouter);
app.use("/api/localidades", localidadesRouter);
app.use("/api/proveedores", proveedoresRouter);
app.use("/api/precios", precioRouter);
app.use("/api/productos/:id/precios", historialPrecioRouter);
app.use("/api/productos", productosRouter);
app.use("/api/almacenes", almacenRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/stock", stockRouter);
app.use("/api/pedidos", pedidosRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
