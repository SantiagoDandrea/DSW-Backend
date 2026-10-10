import { ValidationError } from "../../errors/ValidationError.js";

const ROLES_VALIDOS = ["ADMIN", "CLIENTE"];

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

function validarDni(dni) {
  if (typeof dni !== "string") {
    throw new ValidationError("El DNI es obligatorio y debe ser un texto.");
  }

  const dniNormalizado = dni.trim();

  if (dniNormalizado.length === 0) {
    throw new ValidationError("El DNI es obligatorio y no puede estar vacío.");
  }

  if (!/^\d{7,8}$/.test(dniNormalizado)) {
    throw new ValidationError("El DNI debe tener entre 7 y 8 dígitos numéricos.");
  }

  return dniNormalizado;
}

function validarEmail(email) {
  if (typeof email !== "string") {
    throw new ValidationError("El correo electrónico es obligatorio y debe ser un texto.");
  }

  const emailNormalizado = email.trim();

  if (emailNormalizado.length === 0) {
    throw new ValidationError("El correo electrónico es obligatorio y no puede estar vacío.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    throw new ValidationError("El correo electrónico no tiene un formato válido.");
  }

  return emailNormalizado;
}

function validarPassword(password) {
  if (typeof password !== "string") {
    throw new ValidationError("La contraseña es obligatoria y debe ser un texto.");
  }

  if (password.length < 8) {
    throw new ValidationError("La contraseña debe tener al menos 8 caracteres.");
  }

  if (!/[A-Z]/.test(password)) {
    throw new ValidationError("La contraseña debe tener al menos una mayúscula.");
  }

  if (!/[a-z]/.test(password)) {
    throw new ValidationError("La contraseña debe tener al menos una minúscula.");
  }

  if (!/[0-9]/.test(password)) {
    throw new ValidationError("La contraseña debe tener al menos un número.");
  }

  return password;
}

function validarActivo(activo) {
  if (activo === undefined || activo === null) return undefined;
  if (typeof activo !== "boolean") {
    throw new ValidationError("El campo activo debe ser un booleano.");
  }
  return activo;
}

function validarRol(rol) {
  if (!ROLES_VALIDOS.includes(rol)) {
    throw new ValidationError("El rol debe ser ADMIN o CLIENTE.");
  }

  return rol;
}

function validarDatosCreacion(body) {
  const dni = validarDni(body.dni);
  const nombre = validarTexto(body.nombre, "nombre");
  const apellido = validarTexto(body.apellido, "apellido");
  const email = validarEmail(body.email);
  const telefono = validarTexto(body.telefono, "telefono");
  const rol = validarRol(body.rol);
  const localidadId = validarIdReferencia(body.localidadId, "localidadId");
  const password = validarPassword(body.password);

  return { dni, nombre, apellido, email, telefono, rol, localidadId, password };
}

function validarDatosActualizacion(body) {
  const nombre = validarTexto(body.nombre, "nombre");
  const apellido = validarTexto(body.apellido, "apellido");
  const email = validarEmail(body.email);
  const telefono = validarTexto(body.telefono, "telefono");
  const rol = validarRol(body.rol);
  const localidadId = validarIdReferencia(body.localidadId, "localidadId");
  const activo = validarActivo(body.activo);

  const datos = { nombre, apellido, email, telefono, rol, localidadId };
  if (activo !== undefined) datos.activo = activo;
  return datos;
}

export function validateCrearUsuario(req, res, next) {
  try {
    req.body = validarDatosCreacion(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateActualizarUsuario(req, res, next) {
  try {
    const datos = validarDatosActualizacion(req.body);

    if (req.body.password !== undefined) {
      datos.password = validarPassword(req.body.password);
    }

    req.body = datos;
    next();
  } catch (err) {
    next(err);
  }
}

function validarDatosRegistro(body) {
  const dni = validarDni(body.dni);
  const nombre = validarTexto(body.nombre, "nombre");
  const apellido = validarTexto(body.apellido, "apellido");
  const email = validarEmail(body.email);
  const telefono = validarTexto(body.telefono, "telefono");
  const localidadId = validarIdReferencia(body.localidadId, "localidadId");
  const password = validarPassword(body.password);

  // El registro público siempre crea un CLIENTE, "rol" nunca se acepta del body
  return { dni, nombre, apellido, email, telefono, localidadId, password, rol: "CLIENTE" };
}

export function validateRegistro(req, res, next) {
  try {
    req.body = validarDatosRegistro(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

function validarDatosActualizacionPropia(body) {
  const nombre = validarTexto(body.nombre, "nombre");
  const apellido = validarTexto(body.apellido, "apellido");
  const email = validarEmail(body.email);
  const telefono = validarTexto(body.telefono, "telefono");
  const localidadId = validarIdReferencia(body.localidadId, "localidadId");

  const datos = { nombre, apellido, email, telefono, localidadId };
  return datos;
}

export function validateActualizarMe(req, res, next) {
  try {
    const datos = validarDatosActualizacionPropia(req.body);

    if (req.body.password !== undefined) {
      datos.password = validarPassword(req.body.password);
    }

    req.body = datos;
    next();
  } catch (err) {
    next(err);
  }
}

export function validateDniUsuario(req, res, next) {
  try {
    req.params.dni = validarDni(req.params.dni);
    next();
  } catch (err) {
    next(err);
  }
}

export function validateFiltrosUsuarios(req, res, next) {
  try {
    const { nombre, apellido, rol } = req.query;
    const filtros = {};

    if (nombre !== undefined) {
      filtros.nombre = String(nombre).trim();
    }

    if (apellido !== undefined) {
      filtros.apellido = String(apellido).trim();
    }

    if (rol !== undefined) {
      filtros.rol = validarRol(rol);
    }

    req.filtros = filtros;
    next();
  } catch (err) {
    next(err);
  }
}
