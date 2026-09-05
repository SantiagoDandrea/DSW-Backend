import { Router } from "express";
import { precioController } from "./precio.controller.js";
import {
  validateCrearPrecio,
  validateActualizarPrecio,
  validateIdPrecio,
  validateIdProductoPrecio,
  validateFiltrosPrecio,
} from "./precio.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las operaciones de gestión de precios son administrativas
router.use(authMiddleware, requireRole("ADMIN"));

router.get("/", validateFiltrosPrecio, precioController.obtenerPrecios);
router.get(
  "/:id",
  validateIdPrecio,
  precioController.obtenerPrecioPorId
);
router.post("/", validateCrearPrecio, precioController.crearPrecio);
router.put(
  "/:id",
  validateIdPrecio,
  validateActualizarPrecio,
  precioController.actualizarPrecio
);
router.delete(
  "/:id",
  validateIdPrecio,
  precioController.eliminarPrecio
);

export const historialPrecioRouter = Router({ mergeParams: true });

// El historial de precios es una consulta administrativa
historialPrecioRouter.use(authMiddleware, requireRole("ADMIN"));

historialPrecioRouter.get(
  "/",
  validateIdProductoPrecio,
  precioController.obtenerHistorialPrecios
);

export default router;
