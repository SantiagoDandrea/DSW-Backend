import { Router } from "express";
import { usuarioController } from "./usuario.controller.js";
import {
  validateCrearUsuario,
  validateActualizarUsuario,
  validateDniUsuario,
  validateFiltrosUsuarios,
} from "./usuario.validation.js";

const router = Router();

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
