import { Router } from "express";
import { pedidoController } from "./pedido.controller.js";
import {
  validateCrearPedido,
  validateIdPedido,
  validateFiltrosPedidos,
  validateCambiarEstado,
  validateActualizarPedido,
} from "./pedido.validation.js";
import {
  authMiddleware,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de pedidos requieren autenticación JWT
router.use(authMiddleware);

router.get("/", validateFiltrosPedidos, pedidoController.obtenerPedidos);

router.get("/:id", validateIdPedido, pedidoController.obtenerPedidoPorId);

router.post("/", validateCrearPedido, pedidoController.crearPedido);

router.patch(
  "/:id/estado",
  requireRole("ADMIN"),
  validateIdPedido,
  validateCambiarEstado,
  pedidoController.cambiarEstado
);

router.post(
  "/:id/cancelar",
  validateIdPedido,
  pedidoController.cancelarPedido
);

router.put(
  "/:id",
  requireRole("ADMIN"),
  validateIdPedido,
  validateActualizarPedido,
  pedidoController.actualizarPedido
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  validateIdPedido,
  pedidoController.eliminarPedido
);

export default router;
