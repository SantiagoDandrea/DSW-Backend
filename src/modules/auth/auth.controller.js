import { authService } from "./auth.service.js";
import { mapUsuario } from "../usuarios/usuario.mapper.js";

export const authController = {
  async login(req, res, next) {
    try {
      const { token, usuario } = await authService.login(req.body);
      res.json({ token, usuario: mapUsuario(usuario) });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      res.status(200).json({ mensaje: "Sesión cerrada." });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const usuario = await authService.obtenerUsuarioActual(req.usuario.dni);
      res.json(mapUsuario(usuario));
    } catch (err) {
      next(err);
    }
  },
};
