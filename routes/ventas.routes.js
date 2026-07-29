import { Router } from 'express';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import validarObjectId from '../middleware/validarObjectId.js';
import {
  misVentas,
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
} from '../controllers/ventas.controller.js';

const router = Router();

router.get('/mis-ventas', verificarToken, misVentas);
router.get('/', verificarToken, verificarAdmin, listar);
router.get('/:id', validarObjectId(), verificarToken, obtenerPorId);
router.post('/', verificarToken, crear);
router.put('/:id', validarObjectId(), verificarToken, verificarAdmin, actualizar);
router.delete('/:id', validarObjectId(), verificarToken, verificarAdmin, eliminar);

export default router;
