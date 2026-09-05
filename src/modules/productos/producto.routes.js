import { Router } from "express";
import { productoController } from "./producto.controller.js";
import {
  validateCrearProducto,
  validateActualizarProducto,
  validateIdProducto,
  validateAgregarImagen,
  validateIdImagen,
  validateFiltrosProductos,
} from "./producto.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas de catálogo
router.get("/", validateFiltrosProductos, productoController.obtenerProductos);
router.get("/:id/imagenes", validateIdProducto, productoController.obtenerImagenes);
router.get("/:id", validateIdProducto, productoController.obtenerProductoPorId);

// Operaciones administrativas restringidas a ADMIN
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateCrearProducto,
  productoController.crearProducto
);
router.post(
  "/:id/imagenes",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdProducto,
  validateAgregarImagen,
  productoController.agregarImagen
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdProducto,
  validateActualizarProducto,
  productoController.actualizarProducto
);

router.delete(
  "/imagenes/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdImagen,
  productoController.eliminarImagen
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateIdProducto,
  productoController.eliminarProducto
);

export default router;
