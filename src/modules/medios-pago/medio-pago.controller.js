import { medioPagoService } from "./medio-pago.service.js";
import { mapMedioPago, mapMediosPago } from "./medio-pago.mapper.js";

export const medioPagoController = {
  async crearMedioPago(req, res, next) {
    try {
      const medioPago = await medioPagoService.crearMedioPago(req.body);
      res.status(201).json(mapMedioPago(medioPago));
    } catch (err) {
      next(err);
    }
  },

  async obtenerMediosPago(req, res, next) {
    try {
      const mediosPago = await medioPagoService.obtenerMediosPago();
      res.json(mapMediosPago(mediosPago));
    } catch (err) {
      next(err);
    }
  },

  async obtenerMedioPagoPorId(req, res, next) {
    try {
      const medioPago = await medioPagoService.obtenerMedioPagoPorId(req.params.id);
      res.json(mapMedioPago(medioPago));
    } catch (err) {
      next(err);
    }
  },

  async actualizarMedioPago(req, res, next) {
    try {
      const medioPago = await medioPagoService.actualizarMedioPago(req.params.id, req.body);
      res.json(mapMedioPago(medioPago));
    } catch (err) {
      next(err);
    }
  },

  async eliminarMedioPago(req, res, next) {
    try {
      await medioPagoService.eliminarMedioPago(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
