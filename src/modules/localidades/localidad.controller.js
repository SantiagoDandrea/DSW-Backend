import { localidadService } from "./localidad.service.js";
import { mapLocalidad, mapLocalidades } from "./localidad.mapper.js";

export const localidadController = {
  async crearLocalidad(req, res, next) {
    try {
      const localidad = await localidadService.crearLocalidad(req.body);
      res.status(201).json(mapLocalidad(localidad));
    } catch (err) {
      next(err);
    }
  },

  async obtenerLocalidades(req, res, next) {
    try {
      const localidades = await localidadService.obtenerLocalidades();
      res.json(mapLocalidades(localidades));
    } catch (err) {
      next(err);
    }
  },

  async obtenerLocalidadPorId(req, res, next) {
    try {
      const localidad = await localidadService.obtenerLocalidadPorId(req.params.id);
      res.json(mapLocalidad(localidad));
    } catch (err) {
      next(err);
    }
  },

  async actualizarLocalidad(req, res, next) {
    try {
      const localidad = await localidadService.actualizarLocalidad(req.params.id, req.body);
      res.json(mapLocalidad(localidad));
    } catch (err) {
      next(err);
    }
  },

  async eliminarLocalidad(req, res, next) {
    try {
      await localidadService.eliminarLocalidad(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
