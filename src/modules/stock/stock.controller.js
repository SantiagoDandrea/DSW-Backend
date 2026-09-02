import { stockService } from "./stock.service.js";
import { mapStock } from "./stock.mapper.js";

export const obtenerStocks = async (req, res, next) => {
  try {
    const stocks = await stockService.obtenerStocks(req.filtros);

    res.status(200).json(stocks.map(mapStock));
  } catch (err) {
    next(err);
  }
};

export const obtenerStockPorId = async (req, res, next) => {
  try {
    const stock = await stockService.obtenerStockPorId(req.params.id);

    res.status(200).json(mapStock(stock));
  } catch (err) {
    next(err);
  }
};

export const crearStock = async (req, res, next) => {
  try {
    const stock = await stockService.crearStock(req.body);

    res.status(201).json(mapStock(stock));
  } catch (err) {
    next(err);
  }
};

export const actualizarStock = async (req, res, next) => {
  try {
    const stock = await stockService.actualizarStock(
      req.params.id,
      req.body
    );

    res.status(200).json(mapStock(stock));
  } catch (err) {
    next(err);
  }
};

export const eliminarStock = async (req, res, next) => {
  try {
    await stockService.eliminarStock(req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
