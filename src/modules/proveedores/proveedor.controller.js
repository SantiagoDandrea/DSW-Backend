import { proveedorService } from "./proveedor.service.js";
import { mapProveedor, mapProveedores } from "./proveedor.mapper.js";

export const proveedorController = {
  async crearProveedor(req, res) {
    const proveedor = await proveedorService.crearProveedor(req.body);
    res.status(201).json(mapProveedor(proveedor));
  },

  async obtenerProveedores(req, res) {
    const proveedores = await proveedorService.obtenerProveedores();
    res.json(mapProveedores(proveedores));
  },

  async obtenerProveedorPorId(req, res) {
    const proveedor = await proveedorService.obtenerProveedorPorId(req.params.id);
    res.json(mapProveedor(proveedor));
  },

  async actualizarProveedor(req, res) {
    const proveedor = await proveedorService.actualizarProveedor(req.params.id, req.body);
    res.json(mapProveedor(proveedor));
  },

  async eliminarProveedor(req, res) {
    await proveedorService.eliminarProveedor(req.params.id);
    res.status(204).send();
  },
};
