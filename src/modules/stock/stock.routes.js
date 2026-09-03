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

const router = Router();

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
