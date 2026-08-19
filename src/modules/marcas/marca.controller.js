import { marcaService } from "./marca.service.js";
import { mapMarca, mapMarcas } from "./marca.mapper.js";

export const marcaController = {
  async crearMarca(req, res) {
    const marca = await marcaService.crearMarca(req.body);
    res.status(201).json(mapMarca(marca));
  },

  async obtenerMarcas(req, res) {
    const marcas = await marcaService.obtenerMarcas();
    res.json(mapMarcas(marcas));
  },

  async obtenerMarcaPorId(req, res) {
    const marca = await marcaService.obtenerMarcaPorId(req.params.id);
    res.json(mapMarca(marca));
  },

  async actualizarMarca(req, res) {
    const marca = await marcaService.actualizarMarca(req.params.id, req.body);
    res.json(mapMarca(marca));
  },

  async eliminarMarca(req, res) {
    await marcaService.eliminarMarca(req.params.id);
    res.status(204).send();
  },
};
