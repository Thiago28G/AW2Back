import mongoose from 'mongoose';

const itemVentaSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: [true, 'El producto es obligatorio'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser al menos 1'],
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio unitario no puede ser negativo'],
    },
  },
  { _id: false }
);

const ventaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'La venta debe estar asociada a un usuario'],
    },
    productos: {
      type: [itemVentaSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'La venta debe contener al menos un producto',
      },
    },
    total: {
      type: Number,
      required: [true, 'El total es obligatorio'],
      min: [0, 'El total no puede ser negativo'],
    },
    estado: {
      type: String,
      enum: {
        values: ['pendiente', 'pagada', 'enviada', 'cancelada'],
        message: '{VALUE} no es un estado válido',
      },
      default: 'pendiente',
    },
  },
  { timestamps: true }
);

const Venta = mongoose.model('Venta', ventaSchema);

export default Venta;
