import { categoriaService } from "./categoria.service.js";
import { mapCategoria, mapCategorias } from "./categoria.mapper.js";

export const categoriaController = {
  async crearCategoria(req, res, next) {
    try {
      const categoria = await categoriaService.crearCategoria(req.body);
      res.status(201).json(mapCategoria(categoria));
    } catch (err) {
      next(err);
    }
  },

  async obtenerCategorias(req, res, next) {
    try {
      const categorias = await categoriaService.obtenerCategorias();
      res.json(mapCategorias(categorias));
    } catch (err) {
      next(err);
    }
  },

  async obtenerCategoriaPorId(req, res, next) {
    try {
      const categoria = await categoriaService.obtenerCategoriaPorId(req.params.id);
      res.json(mapCategoria(categoria));
    } catch (err) {
      next(err);
    }
  },

  async actualizarCategoria(req, res, next) {
    try {
      const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
      res.json(mapCategoria(categoria));
    } catch (err) {
      next(err);
    }
  },

  async eliminarCategoria(req, res, next) {
    try {
      await categoriaService.eliminarCategoria(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
