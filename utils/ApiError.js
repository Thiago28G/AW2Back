class ApiError extends Error {
  constructor(statusCode, mensaje, detalle = null) {
    super(mensaje);
    this.statusCode = statusCode;
    this.mensaje = mensaje;
    this.detalle = detalle;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
