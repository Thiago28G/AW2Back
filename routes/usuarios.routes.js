import { Router } from 'express';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import validarObjectId from '../middleware/validarObjectId.js';
import {
  registrar,
  login,
  logout,
  perfil,
  listar,
  obtenerPorId,
  actualizar,
  eliminar,
} from '../controllers/usuarios.controller.js';

const router = Router();

router.post('/registro', registrar);
router.post('/login', login);
router.post('/logout', logout);
router.get('/perfil', verificarToken, perfil);
router.get('/', verificarToken, verificarAdmin, listar);
router.get('/:id', validarObjectId(), verificarToken, verificarAdmin, obtenerPorId);
router.put('/:id', validarObjectId(), verificarToken, actualizar);
router.delete('/:id', validarObjectId(), verificarToken, verificarAdmin, eliminar);

export default router;
