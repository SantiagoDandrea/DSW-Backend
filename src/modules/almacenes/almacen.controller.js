import { almacenService } from "./almacen.service.js";
import { almacenMapper } from "./almacen.mapper.js";

export const obtenerAlmacenes = async (req, res, next) => {
  try {
    const almacenes = await almacenService.obtenerAlmacenes();

    res.status(200).json(almacenMapper.mapearAlmacenes(almacenes));
  } catch (err) {
    next(err);
  }
};

export const obtenerAlmacenPorId = async (req, res, next) => {
  try {
    const almacen = await almacenService.obtenerAlmacenPorId(req.params.id);

    res.status(200).json(almacenMapper.mapearAlmacen(almacen));
  } catch (err) {
    next(err);
  }
};

export const crearAlmacen = async (req, res, next) => {
  try {
    const almacen = await almacenService.crearAlmacen(req.body);

    res.status(201).json(almacenMapper.mapearAlmacen(almacen));
  } catch (err) {
    next(err);
  }
};

export const actualizarAlmacen = async (req, res, next) => {
  try {
    const almacen = await almacenService.actualizarAlmacen(
      req.params.id,
      req.body
    );

    res.status(200).json(almacenMapper.mapearAlmacen(almacen));
  } catch (err) {
    next(err);
  }
};

export const eliminarAlmacen = async (req, res, next) => {
  try {
    await almacenService.eliminarAlmacen(req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};