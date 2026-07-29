import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: ['Computadoras', 'Periféricos', 'Monitores', 'Audio', 'Almacenamiento'],
        message: '{VALUE} no es una categoría válida',
      },
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    imagen: {
      type: String,
      default: '',
    },
    destacado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;
