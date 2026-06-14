import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import { client } from '../db.js';

dotenv.config();

const router = express.Router();

function coleccion() {
    return client.db(process.env.MONGO_DB).collection('usuarios');
}

function sinContraseña({ contraseña, ...resto }) {
    return resto;
}

router.get('/', async (req, res) => {
    try {
        const usuarios = await coleccion().find({}, { projection: { contraseña: 0 } }).toArray();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const usuario = await coleccion().findOne(
            { _id: new ObjectId(req.params.id) },
            { projection: { contraseña: 0 } }
        );
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, contraseña } = req.body;
        if (!email || !contraseña) return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });

        const usuario = await coleccion().findOne({ email });
        if (!usuario) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        if (!usuario.activo) return res.status(403).json({ mensaje: 'La cuenta está inactiva' });

        const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!esValida) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict' });
        res.json({ mensaje: 'Login exitoso', usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el login', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { contraseña, ...resto } = req.body;

        const yaExiste = await coleccion().findOne({ email: resto.email });
        if (yaExiste) return res.status(409).json({ mensaje: 'Ya existe un usuario con ese email' });

        const contraseñaHasheada = await bcrypt.hash(contraseña, 10);
        const nuevo = { ...resto, contraseña: contraseñaHasheada, activo: true, verificado: false };

        const resultado = await coleccion().insertOne(nuevo);
        res.status(201).json({ _id: resultado.insertedId, ...sinContraseña(nuevo) });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { contraseña, ...campos } = req.body;
        const actualizacion = { ...campos };

        if (contraseña) {
            actualizacion.contraseña = await bcrypt.hash(contraseña, 10);
        }

        const resultado = await coleccion().findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: actualizacion },
            { returnDocument: 'after', projection: { contraseña: 0 } }
        );

        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const _id = new ObjectId(req.params.id);

        const tieneVentas = await client.db(process.env.MONGO_DB).collection('ventas').findOne({ id_usuario: _id });
        if (tieneVentas) {
            return res.status(409).json({ mensaje: 'No se puede eliminar el usuario porque tiene ventas asociadas.' });
        }

        const resultado = await coleccion().findOneAndDelete(
            { _id },
            { projection: { contraseña: 0 } }
        );

        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado', usuario: resultado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ mensaje: 'Sesión cerrada' });
});

export default router;
