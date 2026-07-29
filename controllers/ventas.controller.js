import mongoose from 'mongoose';
import Venta from '../models/Venta.js';
import Producto from '../models/Producto.js';
import Usuario from '../models/Usuario.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const populateVenta = (query) =>
  query
    .populate('usuario', 'nombre email')
    .populate('productos.producto', 'nombre precio categoria');

export const listar = asyncHandler(async (req, res) => {
  const ventas = await populateVenta(Venta.find()).sort({ createdAt: -1 });
  res.json(ventas);
});

export const misVentas = asyncHandler(async (req, res) => {
  const ventas = await populateVenta(Venta.find({ usuario: req.usuario.id })).sort({
    createdAt: -1,
  });
  res.json(ventas);
});

export const obtenerPorId = asyncHandler(async (req, res) => {
  const venta = await populateVenta(Venta.findById(req.params.id));
  if (!venta) throw new ApiError(404, 'Venta no encontrada');

  const esPropia = venta.usuario._id.toString() === req.usuario.id;
  if (!esPropia && req.usuario.rol !== 'admin') {
    throw new ApiError(403, 'No tenés permiso para ver esta venta');
  }

  res.json(venta);
});

export const crear = asyncHandler(async (req, res) => {
  // a) Validar estructura del body
  if (!Array.isArray(req.body.productos) || req.body.productos.length === 0) {
    throw new ApiError(400, 'La venta debe incluir al menos un producto');
  }

  // b) Validar que el usuario exista
  const usuario = await Usuario.findById(req.usuario.id);
  if (!usuario) throw new ApiError(404, 'El usuario asociado a la venta no existe');

  // c) Validar formato de cada ítem
  for (const item of req.body.productos) {
    if (!mongoose.Types.ObjectId.isValid(item.producto)) {
      throw new ApiError(400, `El id de producto '${item.producto}' no tiene un formato válido`);
    }
    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new ApiError(400, `La cantidad para el producto '${item.producto}' debe ser un entero mayor a 0`);
    }
  }

  const ids = req.body.productos.map((i) => i.producto);

  // d) Buscar todos los productos en una sola query
  const productosDB = await Producto.find({ _id: { $in: ids } });
  const mapaProductos = new Map(productosDB.map((p) => [p._id.toString(), p]));

  for (const id of ids) {
    if (!mapaProductos.has(id.toString())) {
      throw new ApiError(404, `Producto no encontrado: ${id}`);
    }
  }

  // e) Verificar stock
  for (const item of req.body.productos) {
    const prod = mapaProductos.get(item.producto.toString());
    if (prod.stock < item.cantidad) {
      throw new ApiError(
        409,
        `Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}`
      );
    }
  }

  // f) Calcular total usando precios de la base
  let total = 0;
  const itemsVenta = req.body.productos.map((item) => {
    const prod = mapaProductos.get(item.producto.toString());
    total += prod.precio * item.cantidad;
    return { producto: prod._id, cantidad: item.cantidad, precioUnitario: prod.precio };
  });

  // g) Descontar stock
  await Promise.all(
    req.body.productos.map((item) =>
      Producto.findByIdAndUpdate(item.producto, { $inc: { stock: -item.cantidad } })
    )
  );

  // h) Crear la venta
  const venta = await Venta.create({
    usuario: req.usuario.id,
    productos: itemsVenta,
    total,
    estado: 'pendiente',
  });

  // i) Responder con populate
  const ventaPopulada = await populateVenta(Venta.findById(venta._id));
  res.status(201).json(ventaPopulada);
});

export const actualizar = asyncHandler(async (req, res) => {
  const { estado } = req.body;

  const venta = await Venta.findByIdAndUpdate(
    req.params.id,
    { estado },
    { new: true, runValidators: true }
  );
  if (!venta) throw new ApiError(404, 'Venta no encontrada');

  res.json(venta);
});

export const eliminar = asyncHandler(async (req, res) => {
  const venta = await Venta.findById(req.params.id);
  if (!venta) throw new ApiError(404, 'Venta no encontrada');

  // Reponer stock antes de borrar
  await Promise.all(
    venta.productos.map((item) =>
      Producto.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } })
    )
  );

  await venta.deleteOne();

  res.json({ mensaje: 'Venta eliminada y stock repuesto correctamente' });
});
