import { Router } from "express";
import { medioPagoController } from "./medio-pago.controller.js";
import {
  validateCrearMedioPago,
  validateActualizarMedioPago,
  validateIdMedioPago,
} from "./medio-pago.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas de medios de pago disponibles para compra
router.get("/", medioPagoController.obtenerMediosPago);
router.get("/:id", validateIdMedioPago, medioPagoController.obtenerMedioPagoPorId);

// Operaciones administrativas restringidas a ADMIN
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateCrearMedioPago,
  medioPagoController.crearMedioPago
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdMedioPago,
  validateActualizarMedioPago,
  medioPagoController.actualizarMedioPago
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdMedioPago,
  medioPagoController.eliminarMedioPago
);

export default router;
