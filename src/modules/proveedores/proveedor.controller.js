import { proveedorService } from "./proveedor.service.js";
import { mapProveedor, mapProveedores } from "./proveedor.mapper.js";

export const proveedorController = {
  async crearProveedor(req, res, next) {
    try {
      const proveedor = await proveedorService.crearProveedor(req.body);
      res.status(201).json(mapProveedor(proveedor));
    } catch (err) {
      next(err);
    }
  },

  async obtenerProveedores(req, res, next) {
    try {
      const proveedores = await proveedorService.obtenerProveedores();
      res.json(mapProveedores(proveedores));
    } catch (err) {
      next(err);
    }
  },

  async obtenerProveedorPorId(req, res, next) {
    try {
      const proveedor = await proveedorService.obtenerProveedorPorId(req.params.id);
      res.json(mapProveedor(proveedor));
    } catch (err) {
      next(err);
    }
  },

  async actualizarProveedor(req, res, next) {
    try {
      const proveedor = await proveedorService.actualizarProveedor(req.params.id, req.body);
      res.json(mapProveedor(proveedor));
    } catch (err) {
      next(err);
    }
  },

  async eliminarProveedor(req, res, next) {
    try {
      await proveedorService.eliminarProveedor(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
