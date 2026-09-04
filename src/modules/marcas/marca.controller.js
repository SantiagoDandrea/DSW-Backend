import { marcaService } from "./marca.service.js";
import { mapMarca, mapMarcas } from "./marca.mapper.js";

export const marcaController = {
  async crearMarca(req, res, next) {
    try {
      const marca = await marcaService.crearMarca(req.body);
      res.status(201).json(mapMarca(marca));
    } catch (err) {
      next(err);
    }
  },

  async obtenerMarcas(req, res, next) {
    try {
      const marcas = await marcaService.obtenerMarcas();
      res.json(mapMarcas(marcas));
    } catch (err) {
      next(err);
    }
  },

  async obtenerMarcaPorId(req, res, next) {
    try {
      const marca = await marcaService.obtenerMarcaPorId(req.params.id);
      res.json(mapMarca(marca));
    } catch (err) {
      next(err);
    }
  },

  async actualizarMarca(req, res, next) {
    try {
      const marca = await marcaService.actualizarMarca(req.params.id, req.body);
      res.json(mapMarca(marca));
    } catch (err) {
      next(err);
    }
  },

  async eliminarMarca(req, res, next) {
    try {
      await marcaService.eliminarMarca(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
