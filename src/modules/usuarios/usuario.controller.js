import { usuarioService } from "./usuario.service.js";
import {
  mapUsuario,
  mapUsuarios,
} from "./usuario.mapper.js";

export const usuarioController = {
  async crearUsuario(req, res, next) {
    try {
      const usuario = await usuarioService.crearUsuario(req.body);
      res.status(201).json(mapUsuario(usuario));
    } catch (err) {
      next(err);
    }
  },

  async obtenerUsuarios(req, res, next) {
    try {
      const usuarios = await usuarioService.obtenerUsuarios(req.filtros);
      res.json(mapUsuarios(usuarios));
    } catch (err) {
      next(err);
    }
  },

  async obtenerUsuarioPorDni(req, res, next) {
    try {
      const usuario = await usuarioService.obtenerUsuarioPorDni(req.params.dni);
      res.json(mapUsuario(usuario));
    } catch (err) {
      next(err);
    }
  },

  async actualizarUsuario(req, res, next) {
    try {
      const usuario = await usuarioService.actualizarUsuario(req.params.dni, req.body);
      res.json(mapUsuario(usuario));
    } catch (err) {
      next(err);
    }
  },

  async eliminarUsuario(req, res, next) {
    try {
      await usuarioService.eliminarUsuario(req.params.dni);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
