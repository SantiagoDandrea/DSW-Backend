import { Router } from "express";
import { localidadController } from "./localidad.controller.js";
import {
  validateCrearLocalidad,
  validateActualizarLocalidad,
  validateIdLocalidad,
} from "./localidad.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas de consulta
router.get("/", localidadController.obtenerLocalidades);
router.get("/:id", validateIdLocalidad, localidadController.obtenerLocalidadPorId);

// Operaciones administrativas restringidas a ADMIN
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateCrearLocalidad,
  localidadController.crearLocalidad
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdLocalidad,
  validateActualizarLocalidad,
  localidadController.actualizarLocalidad
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdLocalidad,
  localidadController.eliminarLocalidad
);

export default router;
