import { Router } from "express";
import { productoController } from "./producto.controller.js";
import {
  validateCrearProducto,
  validateActualizarProducto,
  validateIdProducto,
} from "./producto.validation.js";

const router = Router();

router.get("/", productoController.obtenerProductos);
router.get("/:id", validateIdProducto, productoController.obtenerProductoPorId);
router.post("/", validateCrearProducto, productoController.crearProducto);
router.put("/:id", validateIdProducto, validateActualizarProducto, productoController.actualizarProducto);
router.delete("/:id", validateIdProducto, productoController.eliminarProducto);

export default router;