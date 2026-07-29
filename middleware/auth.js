import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

export const verificarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return next(new ApiError(401, 'No autorizado. Iniciá sesión para continuar.'));

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    next(error);
  }
};

export const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return next(new ApiError(403, 'Acceso prohibido. Se requieren permisos de administrador.'));
  }
  next();
};
