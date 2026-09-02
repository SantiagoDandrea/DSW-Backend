import { Router } from "express";
import { precioController } from "./precio.controller.js";
import {
  validateCrearPrecio,
  validateActualizarPrecio,
  validateIdPrecio,
  validateIdProductoPrecio,
  validateFiltrosPrecio,
} from "./precio.validation.js";

const router = Router();

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

historialPrecioRouter.get(
  "/",
  validateIdProductoPrecio,
  precioController.obtenerHistorialPrecios
);

export default router;
