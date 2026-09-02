export function mapStock(stock) {
  return {
    id: stock.id,
    productoId: stock.productoId,
    almacenId: stock.almacenId,
    cantidad: stock.cantidad,
  };
}
