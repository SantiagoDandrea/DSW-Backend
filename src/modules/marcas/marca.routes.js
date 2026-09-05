import { Router } from "express";
import { marcaController } from "./marca.controller.js";
import {
  validateCrearMarca,
  validateActualizarMarca,
  validateIdMarca,
} from "./marca.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas
router.get("/", marcaController.obtenerMarcas);
router.get("/:id", validateIdMarca, marcaController.obtenerMarcaPorId);

// Operaciones administrativas restringidas a ADMIN
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateCrearMarca,
  marcaController.crearMarca
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdMarca,
  validateActualizarMarca,
  marcaController.actualizarMarca
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdMarca,
  marcaController.eliminarMarca
);

export default router;
