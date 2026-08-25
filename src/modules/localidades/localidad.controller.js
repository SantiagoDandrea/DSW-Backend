import { localidadService } from "./localidad.service.js";
import { mapLocalidad, mapLocalidades } from "./localidad.mapper.js";

export const localidadController = {
  async crearLocalidad(req, res) {
    const localidad = await localidadService.crearLocalidad(req.body);
    res.status(201).json(mapLocalidad(localidad));
  },

  async obtenerLocalidades(req, res) {
    const localidades = await localidadService.obtenerLocalidades();
    res.json(mapLocalidades(localidades));
  },

  async obtenerLocalidadPorId(req, res) {
    const localidad = await localidadService.obtenerLocalidadPorId(req.params.id);
    res.json(mapLocalidad(localidad));
  },

  async actualizarLocalidad(req, res) {
    const localidad = await localidadService.actualizarLocalidad(req.params.id, req.body);
    res.json(mapLocalidad(localidad));
  },

  async eliminarLocalidad(req, res) {
    await localidadService.eliminarLocalidad(req.params.id);
    res.status(204).send();
  },
};
