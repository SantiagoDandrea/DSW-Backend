import { Router } from "express";
import { productoController } from "./producto.controller.js";
import {
  validateCrearProducto,
  validateActualizarProducto,
  validateIdProducto,
  validateAgregarPrecio,
  validateAgregarImagen,
  validateIdImagen,
  validateFiltrosProductos,
} from "./producto.validation.js";

const router = Router();

router.get("/", validateFiltrosProductos, productoController.obtenerProductos);
router.get("/:id/precios", validateIdProducto, productoController.obtenerHistorialPrecios);
router.get("/:id/imagenes", validateIdProducto, productoController.obtenerImagenes);
router.get("/:id", validateIdProducto, productoController.obtenerProductoPorId);

router.post("/", validateCrearProducto, productoController.crearProducto);
router.post(
  "/:id/precios",
  validateIdProducto,
  validateAgregarPrecio,
  productoController.agregarPrecio
);
router.post(
  "/:id/imagenes",
  validateIdProducto,
  validateAgregarImagen,
  productoController.agregarImagen
);

router.put(
  "/:id",
  validateIdProducto,
  validateActualizarProducto,
  productoController.actualizarProducto
);

router.delete("/imagenes/:id", validateIdImagen, productoController.eliminarImagen);
router.delete("/:id", validateIdProducto, productoController.eliminarProducto);

export default router;
