import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { usuarioRepository } from "./usuario.repository.js";
import { localidadRepository } from "../localidades/localidad.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ConflictError } from "../../errors/ConflictError.js";

const SALT_ROUNDS = 10;

const MENSAJE_DNI_DUPLICADO = "Ya existe un usuario con ese DNI.";
const MENSAJE_EMAIL_DUPLICADO = "Ya existe un usuario con ese email.";

function esRegistroNoEncontrado(err) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

function manejarErrorDuplicado(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const target = String(err.meta?.target || "").toLowerCase();
    if (target.includes("dni") || target.includes("primary")) {
      throw new ConflictError(MENSAJE_DNI_DUPLICADO);
    }
    if (target.includes("email")) {
      throw new ConflictError(MENSAJE_EMAIL_DUPLICADO);
    }
    throw new ConflictError("Ya existe un usuario con ese DNI o email.");
  }
}

function mensajeNoExiste(dni) {
  return `No existe un usuario con dni ${dni}.`;
}

async function validarReferencias({ localidadId }) {
  const localidad = await localidadRepository.obtenerLocalidadPorId(localidadId);

  if (!localidad) {
    throw new NotFoundError(`No existe una localidad con id ${localidadId}.`);
  }
}

export const usuarioService = {
  async crearUsuario({ dni, nombre, apellido, email, password, telefono, rol, localidadId }) {
    await validarReferencias({ localidadId });

    const passHasheada = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      return await usuarioRepository.crearUsuario({
        dni,
        nombre,
        apellido,
        email,
        password: passHasheada,
        telefono,
        rol,
        localidadId,
      });
    } catch (err) {
      manejarErrorDuplicado(err);
      throw err;
    }
  },

  async obtenerUsuarioPorDni(dni) {
    const usuario = await usuarioRepository.obtenerUsuarioPorDni(dni);

    if (!usuario) {
      throw new NotFoundError(mensajeNoExiste(dni));
    }

    return usuario;
  },

  obtenerUsuarios(filtros) {
    return usuarioRepository.obtenerUsuarios(filtros);
  },

  async actualizarUsuario(dni, { nombre, apellido, email, telefono, rol, localidadId, password, activo }) {
    await validarReferencias({ localidadId });

    const datos = { nombre, apellido, email, telefono, rol, localidadId };
    if (activo !== undefined) datos.activo = activo;

    if (password !== undefined) {
      datos.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    try {
      return await usuarioRepository.actualizarUsuario(dni, datos);
    } catch (err) {
      manejarErrorDuplicado(err);
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(dni));
      }
      throw err;
    }
  },

  async eliminarUsuario(dni) {
    try {
      await usuarioRepository.eliminarUsuario(dni);
    } catch (err) {
      if (esRegistroNoEncontrado(err)) {
        throw new NotFoundError(mensajeNoExiste(dni));
      }
      throw err;
    }
  },
};
