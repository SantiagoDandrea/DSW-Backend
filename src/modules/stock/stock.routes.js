import { Router } from "express";

import {
  obtenerStocks,
  obtenerStockPorId,
  crearStock,
  actualizarStock,
  eliminarStock,
} from "./stock.controller.js";

import {
  validateCrearStock,
  validateActualizarStock,
  validateIdStock,
  validateFiltrosStock,
} from "./stock.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las operaciones de gestión de stock son administrativas
router.use(authMiddleware, requireRole("ADMIN"));

router.get(
  "/",
  validateFiltrosStock,
  obtenerStocks
);

router.get(
  "/:id",
  validateIdStock,
  obtenerStockPorId
);

router.post(
  "/",
  validateCrearStock,
  crearStock
);

router.put(
  "/:id",
  validateIdStock,
  validateActualizarStock,
  actualizarStock
);

router.delete(
  "/:id",
  validateIdStock,
  eliminarStock
);

export default router;
