import { Router } from "express";
import { localidadController } from "./localidad.controller.js";
import {
  validateCrearLocalidad,
  validateActualizarLocalidad,
  validateIdLocalidad,
} from "./localidad.validation.js";

const router = Router();

router.get("/", localidadController.obtenerLocalidades);
router.get("/:id", validateIdLocalidad, localidadController.obtenerLocalidadPorId);
router.post("/", validateCrearLocalidad, localidadController.crearLocalidad);
router.put(
  "/:id",
  validateIdLocalidad,
  validateActualizarLocalidad,
  localidadController.actualizarLocalidad
);
router.delete("/:id", validateIdLocalidad, localidadController.eliminarLocalidad);

export default router;
