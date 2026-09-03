import { productoService } from "./producto.service.js";
import {
  mapProducto,
  mapProductos,
  mapImagen,
  mapImagenes,
} from "./producto.mapper.js";

export const productoController = {
  async crearProducto(req, res, next) {
    try {
      const producto = await productoService.crearProducto(req.body);
      res.status(201).json(mapProducto(producto));
    } catch (err) {
      next(err);
    }
  },

  async obtenerProductos(req, res, next) {
    try {
      const productos = await productoService.obtenerProductos(req.filtros);
      res.json(mapProductos(productos));
    } catch (err) {
      next(err);
    }
  },

  async obtenerProductoPorId(req, res, next) {
    try {
      const producto = await productoService.obtenerProductoPorId(req.params.id);
      res.json(mapProducto(producto));
    } catch (err) {
      next(err);
    }
  },

  async actualizarProducto(req, res, next) {
    try {
      const producto = await productoService.actualizarProducto(req.params.id, req.body);
      res.json(mapProducto(producto));
    } catch (err) {
      next(err);
    }
  },

  async eliminarProducto(req, res, next) {
    try {
      await productoService.eliminarProducto(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async agregarImagen(req, res, next) {
    try {
      const imagen = await productoService.agregarImagen(req.params.id, req.body);
      res.status(201).json(mapImagen(imagen));
    } catch (err) {
      next(err);
    }
  },

  async obtenerImagenes(req, res, next) {
    try {
      const imagenes = await productoService.obtenerImagenes(req.params.id);
      res.json(mapImagenes(imagenes));
    } catch (err) {
      next(err);
    }
  },

  async eliminarImagen(req, res, next) {
    try {
      await productoService.eliminarImagen(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
