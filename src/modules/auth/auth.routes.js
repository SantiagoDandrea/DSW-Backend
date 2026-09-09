import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateLogin } from "./auth.validation.js";
import { validateActualizarMe, validateRegistro } from "../usuarios/usuario.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", validateLogin, authController.login);
router.post("/register", validateRegistro, authController.register);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);
router.put("/me", authMiddleware, validateActualizarMe, authController.actualizarMe);

export default router;
