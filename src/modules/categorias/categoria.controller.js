import { categoriaService } from "./categoria.service.js";
import { mapCategoria, mapCategorias } from "./categoria.mapper.js";

export const categoriaController = {
  async crearCategoria(req, res) {
    const categoria = await categoriaService.crearCategoria(req.body);
    res.status(201).json(mapCategoria(categoria));
  },

  async obtenerCategorias(req, res) {
    const categorias = await categoriaService.obtenerCategorias();
    res.json(mapCategorias(categorias));
  },

  async obtenerCategoriaPorId(req, res) {
    const categoria = await categoriaService.obtenerCategoriaPorId(req.params.id);
    res.json(mapCategoria(categoria));
  },

  async actualizarCategoria(req, res) {
    const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
    res.json(mapCategoria(categoria));
  },

  async eliminarCategoria(req, res) {
    await categoriaService.eliminarCategoria(req.params.id);
    res.status(204).send();
  },
};
