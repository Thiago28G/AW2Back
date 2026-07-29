import ApiError from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;
  let mensaje = 'Error interno del servidor';
  let detalle = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    mensaje = err.mensaje;
    detalle = err.detalle;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    mensaje = 'Error de validación';
    detalle = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    mensaje = `El valor '${err.value}' no es válido para el campo '${err.path}'`;
  } else if (err.code === 11000) {
    statusCode = 409;
    mensaje = 'Ya existe un registro con ese valor único';
    detalle = err.keyValue;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    mensaje = 'Token inválido';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    mensaje = 'La sesión expiró, volvé a iniciar sesión';
  } else if (process.env.NODE_ENV !== 'production') {
    detalle = err.message;
  }

  const respuesta = { mensaje };
  if (detalle !== null) respuesta.detalle = detalle;

  res.status(statusCode).json(respuesta);
};
