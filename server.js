import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import conectarDB from './config/db.js';
import usuariosRouter from './routes/usuarios.routes.js';
import productosRouter from './routes/productos.routes.js';
import ventasRouter from './routes/ventas.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

const origenesPermitidos = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ origin: origenesPermitidos, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date() }));

app.get('/', (req, res) => res.json({
  nombre: 'TechStore API',
  descripcion: 'API REST para la gestión de usuarios, productos y ventas de TechStore.',
  estado: 'operativa',
  documentacion: 'https://github.com/Thiago28G/AW2Back',
  endpoints: {
    usuarios: '/api/usuarios',
    productos: '/api/productos',
    ventas: '/api/ventas',
    health: '/api/health',
  },
}));

app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);
app.use('/api/ventas', ventasRouter);

app.use(notFound);
app.use(errorHandler);

const iniciar = async () => {
  await conectarDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
};

iniciar();

process.on('unhandledRejection', (err) => {
  console.error('Rechazo no manejado:', err);
});
