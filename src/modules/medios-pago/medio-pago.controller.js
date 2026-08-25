import { medioPagoService } from "./medio-pago.service.js";
import { mapMedioPago, mapMediosPago } from "./medio-pago.mapper.js";

export const medioPagoController = {
  async crearMedioPago(req, res) {
    const medioPago = await medioPagoService.crearMedioPago(req.body);
    res.status(201).json(mapMedioPago(medioPago));
  },

  async obtenerMediosPago(req, res) {
    const mediosPago = await medioPagoService.obtenerMediosPago();
    res.json(mapMediosPago(mediosPago));
  },

  async obtenerMedioPagoPorId(req, res) {
    const medioPago = await medioPagoService.obtenerMedioPagoPorId(req.params.id);
    res.json(mapMedioPago(medioPago));
  },

  async actualizarMedioPago(req, res) {
    const medioPago = await medioPagoService.actualizarMedioPago(req.params.id, req.body);
    res.json(mapMedioPago(medioPago));
  },

  async eliminarMedioPago(req, res) {
    await medioPagoService.eliminarMedioPago(req.params.id);
    res.status(204).send();
  },
};
