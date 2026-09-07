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
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las operaciones de gestión de almacenes son administrativas
router.use(authMiddleware, requireRole("ADMIN"));

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