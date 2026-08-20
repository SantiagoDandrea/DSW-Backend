import { ValidationError } from "../../errors/ValidationError.js";

const PROVINCIAS_VALIDAS = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Ciudad Autónoma de Buenos Aires",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

function validarNombre(nombre) {
  if (typeof nombre !== "string") {
    throw new ValidationError("El nombre es obligatorio y debe ser un texto.");
  }

  const nombreNormalizado = nombre.trim();

  if (nombreNormalizado.length === 0) {
    throw new ValidationError("El nombre es obligatorio y no puede estar vacío.");
  }

  return nombreNormalizado;
}

function validarCodigoPostal(codigoPostal) {
  if (typeof codigoPostal !== "string") {
    throw new ValidationError("El código postal es obligatorio y debe ser un texto.");
  }

  const codigoPostalNormalizado = codigoPostal.trim();

  if (codigoPostalNormalizado.length === 0) {
    throw new ValidationError("El código postal es obligatorio y no puede estar vacío.");
  }

  return codigoPostalNormalizado;
}

function validarProvincia (provincia) {
  if (typeof provincia !== "string") {
    throw new ValidationError("La provincia es obligatoria y debe ser un texto.");
  }

  const provinciaNormalizada = provincia.trim();

  if (provinciaNormalizada.length === 0) {
    throw new ValidationError("La provincia es obligatoria y no puede estar vacía.");
  }

  if (!PROVINCIAS_VALIDAS.includes(provinciaNormalizada)) {
    throw new ValidationError("La provincia ingresada no es válida.");
  }

  return provinciaNormalizada;
}

export function validateCrearLocalidad(req, res, next) {
  try {
    req.body.nombre = validarNombre(req.body.nombre);
    req.body.codigoPostal = validarCodigoPostal(req.body.codigoPostal);
    req.body.provincia = validarProvincia(req.body.provincia);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarLocalidad(req, res, next) {
  try {
    req.body.nombre = validarNombre(req.body.nombre);
    req.body.codigoPostal = validarCodigoPostal(req.body.codigoPostal);
    req.body.provincia = validarProvincia(req.body.provincia);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateIdLocalidad(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(new ValidationError("El id de la localidad debe ser un número entero positivo."));
  }

  req.params.id = id;
  next();
}
