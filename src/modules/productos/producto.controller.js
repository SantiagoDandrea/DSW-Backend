import { productoService } from "./producto.service.js";
import { mapProducto, mapProductos } from "./producto.mapper.js";

export const productoController = {
  async crearProducto(req, res) {
    const producto = await productoService.crearProducto(req.body);
    res.status(201).json(mapProducto(producto));
  },
  async obtenerProductos(req, res) {
    const productos = await productoService.obtenerProductos();
    res.json(mapProductos(productos));
  },
  async obtenerProductoPorId(req, res) {
    const producto = await productoService.obtenerProductoPorId(req.params.id);
    res.json(mapProducto(producto));
  },
  async actualizarProducto(req, res) {
    const producto = await productoService.actualizarProducto(req.params.id, req.body);
    res.json(mapProducto(producto));
  },
  async eliminarProducto(req, res) {
    await productoService.eliminarProducto(req.params.id);
    res.status(204).send();
  },
};