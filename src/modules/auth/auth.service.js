import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { usuarioRepository } from "../usuarios/usuario.repository.js";
import { usuarioService } from "../usuarios/usuario.service.js";
import { env } from "../../config/env.js";
import { UnauthorizedError } from "../../errors/UnauthorizedError.js";

const MENSAJE_CREDENCIALES_INVALIDAS = "Email o contraseña incorrectos.";
const EXPIRACION_TOKEN = "1d";

function generarToken(usuario) {
  return jwt.sign({ dni: usuario.dni, rol: usuario.rol }, env.jwtSecret, {
    expiresIn: EXPIRACION_TOKEN,
  });
}

export const authService = {
  async login({ email, password }) {
    const usuario = await usuarioRepository.obtenerUsuarioPorEmail(email);

    if (!usuario) {
      throw new UnauthorizedError(MENSAJE_CREDENCIALES_INVALIDAS);
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      throw new UnauthorizedError(MENSAJE_CREDENCIALES_INVALIDAS);
    }

    const token = generarToken(usuario);

    return { token, usuario };
  },

  async register(datosUsuario) {
    const usuario = await usuarioService.crearUsuario(datosUsuario);
    const token = generarToken(usuario);

    return { token, usuario };
  },

  async obtenerUsuarioActual(dni) {
    const usuario = await usuarioRepository.obtenerUsuarioPorDni(dni);

    if (!usuario) {
      throw new UnauthorizedError("El usuario del token ya no existe.");
    }

    return usuario;
  },
};
