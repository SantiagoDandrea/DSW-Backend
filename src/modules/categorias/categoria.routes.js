import { Router } from "express";
import { categoriaController } from "./categoria.controller.js";
import {
  validateCrearCategoria,
  validateActualizarCategoria,
  validateIdCategoria,
} from "./categoria.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas
router.get("/", categoriaController.obtenerCategorias);
router.get("/:id", validateIdCategoria, categoriaController.obtenerCategoriaPorId);

// Operaciones administrativas restringidas a ADMIN
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateCrearCategoria,
  categoriaController.crearCategoria
);
router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdCategoria,
  validateActualizarCategoria,
  categoriaController.actualizarCategoria
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdCategoria,
  categoriaController.eliminarCategoria
);

export default router;
