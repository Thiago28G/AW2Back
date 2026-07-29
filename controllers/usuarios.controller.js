import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import Venta from '../models/Venta.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const cookieOpciones = () => {
  const enProduccion = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: enProduccion,
    sameSite: enProduccion ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000,
  };
};

export const registrar = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body;

  const existe = await Usuario.findOne({ email });
  if (existe) throw new ApiError(409, 'Ya existe un usuario registrado con ese email');

  const usuario = await new Usuario({ nombre, email, password }).save();

  res.status(201).json(usuario);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, 'Email y contraseña son requeridos');

  const usuario = await Usuario.findOne({ email }).select('+password');
  const credencialesValidas = usuario && (await usuario.compararPassword(password));
  if (!credencialesValidas) throw new ApiError(401, 'Credenciales incorrectas');

  if (!usuario.activo) throw new ApiError(403, 'La cuenta está inactiva');

  const token = jwt.sign(
    { id: usuario._id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.cookie('token', token, cookieOpciones());

  res.json({
    mensaje: 'Sesión iniciada correctamente',
    usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOpciones());
  res.json({ mensaje: 'Sesión cerrada' });
});

export const perfil = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
  res.json(usuario);
});

export const listar = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
});

export const obtenerPorId = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
  res.json(usuario);
});

export const actualizar = asyncHandler(async (req, res) => {
  const esPropio = req.usuario.id === req.params.id;
  const esAdmin = req.usuario.rol === 'admin';

  if (!esPropio && !esAdmin) {
    throw new ApiError(403, 'No tenés permiso para modificar este usuario');
  }

  const { password, rol, ...campos } = req.body;

  if (password) {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
    usuario.password = password;
    if (esAdmin && rol !== undefined) usuario.rol = rol;
    Object.assign(usuario, campos);
    const actualizado = await usuario.save();
    return res.json(actualizado);
  }

  if (esAdmin && rol !== undefined) campos.rol = rol;

  const actualizado = await Usuario.findByIdAndUpdate(req.params.id, campos, {
    new: true,
    runValidators: true,
  });
  if (!actualizado) throw new ApiError(404, 'Usuario no encontrado');

  res.json(actualizado);
});

export const eliminar = asyncHandler(async (req, res) => {
  const tieneVentas = await Venta.exists({ usuario: req.params.id });
  if (tieneVentas) {
    throw new ApiError(409, 'No se puede eliminar el usuario porque tiene ventas registradas');
  }

  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');

  res.json({ mensaje: 'Usuario eliminado correctamente' });
});
