import { Router } from "express";
import { medioPagoController } from "./medio-pago.controller.js";
import {
  validateCrearMedioPago,
  validateActualizarMedioPago,
  validateIdMedioPago,
} from "./medio-pago.validation.js";

const router = Router();

router.get("/", medioPagoController.obtenerMediosPago);
router.get("/:id", validateIdMedioPago, medioPagoController.obtenerMedioPagoPorId);
router.post("/", validateCrearMedioPago, medioPagoController.crearMedioPago);
router.put(
  "/:id",
  validateIdMedioPago,
  validateActualizarMedioPago,
  medioPagoController.actualizarMedioPago
);
router.delete("/:id", validateIdMedioPago, medioPagoController.eliminarMedioPago);

export default router;
