import { Router } from "express";
import { proveedorController } from "./proveedor.controller.js";
import {
  validateCrearProveedor,
  validateActualizarProveedor,
  validateIdProveedor,
} from "./proveedor.validation.js";

const router = Router();

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
