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

// Consulta de stock/disponibilidad: pública
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

// Gestión de stock: administrativa
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateCrearStock,
  crearStock
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdStock,
  validateActualizarStock,
  actualizarStock
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdStock,
  eliminarStock
);

export default router;
