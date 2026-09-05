import { Router } from "express";
import { proveedorController } from "./proveedor.controller.js";
import {
  validateCrearProveedor,
  validateActualizarProveedor,
  validateIdProveedor,
} from "./proveedor.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las operaciones de gestión de proveedores son administrativas
router.use(authMiddleware, requireRole("ADMIN"));

router.get("/", proveedorController.obtenerProveedores);
router.get("/:id", validateIdProveedor, proveedorController.obtenerProveedorPorId);
router.post("/", validateCrearProveedor, proveedorController.crearProveedor);
router.put(
  "/:id",
  validateIdProveedor,
  validateActualizarProveedor,
  proveedorController.actualizarProveedor
);
router.delete("/:id", validateIdProveedor, proveedorController.eliminarProveedor);

export default router;
