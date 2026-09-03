import { precioService } from "./precio.service.js";
import { mapPrecio, mapPrecios } from "./precio.mapper.js";

export const precioController = {
  async obtenerPrecios(req, res, next) {
    try {
      const precios = await precioService.obtenerPrecios(req.filtros);
      res.status(200).json(mapPrecios(precios));
    } catch (err) {
      next(err);
    }
  },

  async obtenerPrecioPorId(req, res, next) {
    try {
      const precio = await precioService.obtenerPrecioPorId(req.params.id);
      res.status(200).json(mapPrecio(precio));
    } catch (err) {
      next(err);
    }
  },

  async crearPrecio(req, res, next) {
    try {
      const precio = await precioService.crearPrecio(req.body);
      res.status(201).json(mapPrecio(precio));
    } catch (err) {
      next(err);
    }
  },

  async actualizarPrecio(req, res, next) {
    try {
      const precio = await precioService.actualizarPrecio(
        req.params.id,
        req.body
      );
      res.status(200).json(mapPrecio(precio));
    } catch (err) {
      next(err);
    }
  },

  async eliminarPrecio(req, res, next) {
    try {
      await precioService.eliminarPrecio(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async obtenerHistorialPrecios(req, res, next) {
    try {
      const precios = await precioService.obtenerHistorialPrecios(req.params.id);
      res.status(200).json(mapPrecios(precios));
    } catch (err) {
      next(err);
    }
  },
};
