import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import Producto from '../models/Producto.js';
import Venta from '../models/Venta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const usuarios = [
  { nombre: 'Administrador', email: 'admin@techstore.com', password: 'Admin1234', rol: 'admin' },
  { nombre: 'Lucas Fernández', email: 'lucas@techstore.com', password: 'Lucas1234', rol: 'usuario' },
  { nombre: 'Ana Gómez', email: 'ana@techstore.com', password: 'Ana12345', rol: 'usuario' },
];

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  // 2. Limpiar colecciones
  await Promise.all([
    Usuario.deleteMany({}),
    Producto.deleteMany({}),
    Venta.deleteMany({}),
  ]);
  console.log('Colecciones vaciadas');

  // 3. Insertar productos mapeados
  const productosRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'productos-original.json'), 'utf-8')
  );

  const productosMapeados = productosRaw.map(({ id, desc, ...rest }) => ({
    ...rest,
    descripcion: desc ?? '',
  }));

  const productosInsertados = await Producto.insertMany(productosMapeados);
  console.log(`Productos insertados: ${productosInsertados.length}`);

  // 4. Forzar casos de demostración
  const [p1, p2] = productosInsertados;

  await Producto.findByIdAndUpdate(p1._id, { stock: 0 });
  console.log(`Stock forzado a 0: ${p1.nombre}`);

  await Producto.findByIdAndUpdate(p2._id, { disponible: false });
  console.log(`Disponible forzado a false: ${p2.nombre}`);

  // 5. Insertar usuarios con hash
  const usuariosInsertados = await Promise.all(
    usuarios.map((u) => new Usuario(u).save())
  );
  console.log(`Usuarios insertados: ${usuariosInsertados.length}`);

  // 6. Resumen
  console.log('\n--- Resumen ---');
  console.log(`Productos: ${productosInsertados.length}`);
  console.log(`Usuarios:  ${usuariosInsertados.length}`);
  console.log(`Ventas:    0 (colección limpia)`);

} catch (error) {
  console.error('Error durante el seed:', error);
  process.exit(1);
} finally {
  await mongoose.connection.close();
  console.log('Conexión cerrada');
}
