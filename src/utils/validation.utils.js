import { ValidationError } from "../errors/ValidationError.js";

const VALOR_MAXIMO = 99999999.99;

export function validarMontoMonetario(valor, nombreCampo = "El valor", { permitirCero = true } = {}) {
  if (
    (typeof valor !== "number" && typeof valor !== "string") ||
    (typeof valor === "string" && valor.trim().length === 0)
  ) {
    throw new ValidationError(
      `${nombreCampo} es obligatorio y debe ser un importe monetario válido.`
    );
  }

  const valorNormalizado = String(valor).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(valorNormalizado)) {
    throw new ValidationError(
      `${nombreCampo} debe ser un importe monetario válido con hasta dos decimales.`
    );
  }

  const importe = Number(valorNormalizado);

  if (!Number.isFinite(importe) || importe > VALOR_MAXIMO) {
    throw new ValidationError(
      `${nombreCampo} debe ser un importe monetario menor o igual a ${VALOR_MAXIMO}.`
    );
  }

  if (permitirCero && importe < 0) {
    throw new ValidationError(
      `${nombreCampo} debe ser un número mayor o igual a 0.`
    );
  }

  if (!permitirCero && importe <= 0) {
    throw new ValidationError(
      `${nombreCampo} debe ser un número mayor a 0.`
    );
  }

  return importe;
}
