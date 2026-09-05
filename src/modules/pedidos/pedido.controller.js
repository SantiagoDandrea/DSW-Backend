import { pedidoService } from "./pedido.service.js";
import { mapPedido, mapPedidos } from "./pedido.mapper.js";

export const pedidoController = {
  async obtenerPedidos(req, res, next) {
    try {
      const pedidos = await pedidoService.obtenerPedidos(
        req.filtros,
        req.usuario
      );
      res.status(200).json(mapPedidos(pedidos));
    } catch (err) {
      next(err);
    }
  },

  async obtenerPedidoPorId(req, res, next) {
    try {
      const pedido = await pedidoService.obtenerPedidoPorId(
        req.params.id,
        req.usuario
      );
      res.status(200).json(mapPedido(pedido));
    } catch (err) {
      next(err);
    }
  },

  async crearPedido(req, res, next) {
    try {
      const pedido = await pedidoService.crearPedido({
        usuarioAuth: req.usuario,
        body: req.body,
      });
      res.status(201).json(mapPedido(pedido));
    } catch (err) {
      next(err);
    }
  },

  async cambiarEstado(req, res, next) {
    try {
      const pedido = await pedidoService.cambiarEstado(
        req.params.id,
        req.body.estado,
        req.usuario
      );
      res.status(200).json(mapPedido(pedido));
    } catch (err) {
      next(err);
    }
  },

  async cancelarPedido(req, res, next) {
    try {
      const pedido = await pedidoService.cancelarPedido(
        req.params.id,
        req.usuario
      );
      res.status(200).json(mapPedido(pedido));
    } catch (err) {
      next(err);
    }
  },

  async actualizarPedido(req, res, next) {
    try {
      const pedido = await pedidoService.actualizarPedido(
        req.params.id,
        req.body,
        req.usuario
      );
      res.status(200).json(mapPedido(pedido));
    } catch (err) {
      next(err);
    }
  },

  async eliminarPedido(req, res, next) {
    try {
      await pedidoService.eliminarPedido(req.params.id, req.usuario);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
