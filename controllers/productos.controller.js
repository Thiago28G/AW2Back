import Producto from '../models/Producto.js';
import Venta from '../models/Venta.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

export const obtenerPorId = asyncHandler(async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) throw new ApiError(404, 'Producto no encontrado');
  res.json(producto);
});

export const filtrar = asyncHandler(async (req, res) => {
  const { categoria, precioMin, precioMax, disponible } = req.body;
  const filtro = {};

  if (categoria !== undefined) filtro.categoria = categoria;

  if (disponible !== undefined) filtro.disponible = disponible;

  if (precioMin !== undefined || precioMax !== undefined) {
    filtro.precio = {};
    if (precioMin !== undefined) {
      const min = Number(precioMin);
      if (isNaN(min)) throw new ApiError(400, 'precioMin debe ser un número válido');
      filtro.precio.$gte = min;
    }
    if (precioMax !== undefined) {
      const max = Number(precioMax);
      if (isNaN(max)) throw new ApiError(400, 'precioMax debe ser un número válido');
      filtro.precio.$lte = max;
    }
  }

  const productos = await Producto.find(filtro);
  res.json(productos);
});

export const crear = asyncHandler(async (req, res) => {
  const producto = await new Producto(req.body).save();
  res.status(201).json(producto);
});

export const actualizar = asyncHandler(async (req, res) => {
  const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!producto) throw new ApiError(404, 'Producto no encontrado');
  res.json(producto);
});

export const eliminar = asyncHandler(async (req, res) => {
  const enVenta = await Venta.exists({ 'productos.producto': req.params.id });
  if (enVenta) {
    throw new ApiError(409, 'No se puede eliminar el producto porque está asociado a una o más ventas');
  }

  const producto = await Producto.findByIdAndDelete(req.params.id);
  if (!producto) throw new ApiError(404, 'Producto no encontrado');

  res.json({ mensaje: 'Producto eliminado correctamente' });
});
