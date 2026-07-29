import { Router } from 'express';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import validarObjectId from '../middleware/validarObjectId.js';
import {
  listar,
  filtrar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
} from '../controllers/productos.controller.js';

const router = Router();

router.get('/', listar);
router.post('/filtrar', filtrar);
router.get('/:id', validarObjectId(), obtenerPorId);
router.post('/', verificarToken, verificarAdmin, crear);
router.put('/:id', validarObjectId(), verificarToken, verificarAdmin, actualizar);
router.delete('/:id', validarObjectId(), verificarToken, verificarAdmin, eliminar);

export default router;
