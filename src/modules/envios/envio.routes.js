import { Router } from "express";
import { envioController } from "./envio.controller.js";
import {
  validateIdEnvio,
  validateFiltrosEnvios,
  validateActualizarEnvio,
} from "./envio.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de envíos requieren autenticación JWT
router.use(authMiddleware);

router.get("/", validateFiltrosEnvios, envioController.obtenerEnvios);

router.get("/:id", validateIdEnvio, envioController.obtenerEnvioPorId);

router.put(
  "/:id",
  validateIdEnvio,
  validateActualizarEnvio,
  envioController.actualizarEnvio
);

router.post(
  "/:id/cancelar",
  validateIdEnvio,
  envioController.cancelarEnvio
);

export default router;
