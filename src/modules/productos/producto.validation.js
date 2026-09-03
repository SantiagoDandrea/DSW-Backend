import { ValidationError } from "../../errors/ValidationError.js";
import { validarMontoMonetario } from "../../utils/validation.utils.js";

function validarTexto(valor, nombreCampo) {
  if (typeof valor !== "string") {
    throw new ValidationError(`El campo "${nombreCampo}" es obligatorio y debe ser un texto.`);
  }

  const valorNormalizado = valor.trim();

  if (valorNormalizado.length === 0) {
    throw new ValidationError(`El campo "${nombreCampo}" es obligatorio y no puede estar vacío.`);
  }

  return valorNormalizado;
}

function validarIdReferencia(valor, nombreCampo) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(`El campo "${nombreCampo}" debe ser un número entero positivo.`);
  }

  return id;
}

function validarPrecioPositivo(valor, etiqueta) {
  return validarMontoMonetario(valor, etiqueta, { permitirCero: false });
}

function validarOrden(orden) {
  if (orden === undefined || orden === null) {
    return null;
  }

  if (!Number.isInteger(orden) || orden < 0) {
    throw new ValidationError("El orden de la imagen debe ser un número entero mayor o igual a 0.");
  }

  return orden;
}

function validarUrl(url) {
  if (typeof url !== "string") {
    throw new ValidationError("La url de la imagen es obligatoria y debe ser un texto.");
  }

  const urlNormalizada = url.trim();

  if (urlNormalizada.length === 0) {
    throw new ValidationError("La url de la imagen es obligatoria y no puede estar vacía.");
  }

  if (!/^https?:\/\//i.test(urlNormalizada)) {
    throw new ValidationError("La url de la imagen debe empezar con http:// o https://.");
  }

  return urlNormalizada;
}

function validarDatosProducto(body) {
  const nombre = validarTexto(body.nombre, "nombre");
  const descripcion = validarTexto(body.descripcion, "descripcion");
  const categoriaId = validarIdReferencia(body.categoriaId, "categoriaId");
  const marcaId = validarIdReferencia(body.marcaId, "marcaId");
  const proveedorId = validarIdReferencia(body.proveedorId, "proveedorId");

  return { nombre, descripcion, categoriaId, marcaId, proveedorId };
}

export function validateCrearProducto(req, res, next) {
  try {
    const datos = validarDatosProducto(req.body);
    const precio = validarPrecioPositivo(req.body.precio, "El precio");

    req.body = { ...datos, precio };
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarProducto(req, res, next) {
  try {
    req.body = validarDatosProducto(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdProducto(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(new ValidationError("El id del producto debe ser un número entero positivo."));
  }

  req.params.id = id;
  next();
}

export function validateAgregarImagen(req, res, next) {
  try {
    const url = validarUrl(req.body.url);
    const orden = validarOrden(req.body.orden);
    req.body = { url, orden };
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdImagen(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(new ValidationError("El id de la imagen debe ser un número entero positivo."));
  }

  req.params.id = id;
  next();
}

export function validateFiltrosProductos(req, res, next) {
  try {
    const { categoriaId, marcaId, precioMin, precioMax } = req.query;
    const filtros = {};

    if (categoriaId !== undefined) {
      filtros.categoriaId = validarIdReferencia(categoriaId, "categoriaId");
    }

    if (marcaId !== undefined) {
      filtros.marcaId = validarIdReferencia(marcaId, "marcaId");
    }

    if (req.query.nombre !== undefined) {
      filtros.nombre = String(req.query.nombre).trim();
    }

    if (precioMin !== undefined) {
      const valor = Number(precioMin);
      if (!Number.isFinite(valor) || valor < 0) {
        throw new ValidationError("El filtro precioMin debe ser un número mayor o igual a 0.");
      }
      filtros.precioMin = valor;
    }

    if (precioMax !== undefined) {
      const valor = Number(precioMax);
      if (!Number.isFinite(valor) || valor < 0) {
        throw new ValidationError("El filtro precioMax debe ser un número mayor o igual a 0.");
      }
      filtros.precioMax = valor;
    }

    if (
      filtros.precioMin !== undefined &&
      filtros.precioMax !== undefined &&
      filtros.precioMin > filtros.precioMax
    ) {
      throw new ValidationError("El filtro precioMin no puede ser mayor que precioMax.");
    }

    req.filtros = filtros;
    next();
  } catch (err) {
    next(err);
  }
}
