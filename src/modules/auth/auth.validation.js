import { ValidationError } from "../../errors/ValidationError.js";

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
  if (typeof password !== "string" || password.length === 0) {
    throw new ValidationError("La contraseña es obligatoria.");
  }

  return password;
}

export function validateLogin(req, res, next) {
  try {
    const email = validarEmail(req.body.email);
    const password = validarPassword(req.body.password);

    req.body = { email, password };
    next();
  } catch (err) {
    next(err);
  }
}
