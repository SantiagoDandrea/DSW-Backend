import { Router } from "express";
import { usuarioController } from "./usuario.controller.js";
import {
  validateCrearUsuario,
  validateActualizarUsuario,
  validateDniUsuario,
  validateFiltrosUsuarios,
} from "./usuario.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las operaciones de gestión de usuarios son administrativas
router.use(authMiddleware, requireRole("ADMIN"));

router.get("/", validateFiltrosUsuarios, usuarioController.obtenerUsuarios);
router.get("/:dni", validateDniUsuario, usuarioController.obtenerUsuarioPorDni);

router.post("/", validateCrearUsuario, usuarioController.crearUsuario);

router.put(
  "/:dni",
  validateDniUsuario,
  validateActualizarUsuario,
  usuarioController.actualizarUsuario
);

router.delete("/:dni", validateDniUsuario, usuarioController.eliminarUsuario);

export default router;
