import { envioService } from "./envio.service.js";
import { mapEnvio, mapEnvios } from "./envio.mapper.js";

export const envioController = {
  async obtenerEnvios(req, res, next) {
    try {
      const envios = await envioService.obtenerEnvios(
        req.filtros,
        req.usuario
      );
      res.status(200).json(mapEnvios(envios));
    } catch (err) {
      next(err);
    }
  },

  async obtenerEnvioPorId(req, res, next) {
    try {
      const envio = await envioService.obtenerEnvioPorId(
        req.params.id,
        req.usuario
      );
      res.status(200).json(mapEnvio(envio));
    } catch (err) {
      next(err);
    }
  },

  async actualizarEnvio(req, res, next) {
    try {
      const envio = await envioService.actualizarEnvio(
        req.params.id,
        req.body,
        req.usuario
      );
      res.status(200).json(mapEnvio(envio));
    } catch (err) {
      next(err);
    }
  },

  async cancelarEnvio(req, res, next) {
    try {
      const envio = await envioService.cancelarEnvio(
        req.params.id,
        req.usuario
      );
      res.status(200).json(mapEnvio(envio));
    } catch (err) {
      next(err);
    }
  },
};
