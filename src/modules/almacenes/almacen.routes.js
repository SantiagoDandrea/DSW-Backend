import { Router } from "express";
import {
  obtenerAlmacenes,
  obtenerAlmacenPorId,
  crearAlmacen,
  actualizarAlmacen,
  eliminarAlmacen,
} from "./almacen.controller.js";

import {
  validateCrearAlmacen,
  validateActualizarAlmacen,
  validateIdAlmacen,
} from "./almacen.validation.js";

const router = Router();

router.get("/", obtenerAlmacenes);

router.get(
  "/:id",
  validateIdAlmacen,
  obtenerAlmacenPorId
);

router.post(
  "/",
  validateCrearAlmacen,
  crearAlmacen
);

router.put(
  "/:id",
  validateIdAlmacen,
  validateActualizarAlmacen,
  actualizarAlmacen
);

router.delete(
  "/:id",
  validateIdAlmacen,
  eliminarAlmacen
);

export default router;