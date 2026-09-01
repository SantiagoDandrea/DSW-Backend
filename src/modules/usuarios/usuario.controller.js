import { usuarioService } from "./usuario.service.js";
import {
  mapUsuario,
  mapUsuarios,
} from "./usuario.mapper.js";

export const usuarioController = {
  async crearUsuario(req, res) {
    const usuario = await usuarioService.crearUsuario(req.body);
    res.status(201).json(mapUsuario(usuario));
  },

  async obtenerUsuarios(req, res) {
    const usuarios = await usuarioService.obtenerUsuarios(req.filtros);
    res.json(mapUsuarios(usuarios));
  },

  async obtenerUsuarioPorDni(req, res) {
    const usuario = await usuarioService.obtenerUsuarioPorDni(req.params.dni);
    res.json(mapUsuario(usuario));
  },

  async actualizarUsuario(req, res) {
    const usuario = await usuarioService.actualizarUsuario(req.params.dni, req.body);
    res.json(mapUsuario(usuario));
  },

  async eliminarUsuario(req, res) {
    await usuarioService.eliminarUsuario(req.params.dni);
    res.status(204).send();
  },
};
