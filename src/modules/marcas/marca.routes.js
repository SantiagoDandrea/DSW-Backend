import { Router } from "express";
import { marcaController } from "./marca.controller.js";
import {
  validateCrearMarca,
  validateActualizarMarca,
  validateIdMarca,
} from "./marca.validation.js";

const router = Router();

router.get("/", marcaController.obtenerMarcas);
router.get("/:id", validateIdMarca, marcaController.obtenerMarcaPorId);
router.post("/", validateCrearMarca, marcaController.crearMarca);
router.put(
  "/:id",
  validateIdMarca,
  validateActualizarMarca,
  marcaController.actualizarMarca
);
router.delete("/:id", validateIdMarca, marcaController.eliminarMarca);

export default router;
