import express from "express";
import cors from "cors";
import categoriasRouter from "./modules/categorias/index.js";
import marcasRouter from "./modules/marcas/index.js";
import mediosPagoRouter from "./modules/medios-pago/index.js";
import localidadesRouter from "./modules/localidades/index.js";
import proveedoresRouter from "./modules/proveedores/index.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/categorias", categoriasRouter);
app.use("/api/marcas", marcasRouter);
app.use("/api/medios-pago", mediosPagoRouter);
app.use("/api/localidades", localidadesRouter);
app.use("/api/proveedores", proveedoresRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
