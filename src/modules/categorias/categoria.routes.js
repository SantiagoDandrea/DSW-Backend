import { Router } from "express";
import { categoriaController } from "./categoria.controller.js";
import {
  validateCrearCategoria,
  validateActualizarCategoria,
  validateIdCategoria,
} from "./categoria.validation.js";

const router = Router();

router.get("/", categoriaController.obtenerCategorias);
router.get("/:id", validateIdCategoria, categoriaController.obtenerCategoriaPorId);
router.post("/", validateCrearCategoria, categoriaController.crearCategoria);
router.put(
  "/:id",
  validateIdCategoria,
  validateActualizarCategoria,
  categoriaController.actualizarCategoria
);
router.delete("/:id", validateIdCategoria, categoriaController.eliminarCategoria);

export default router;
