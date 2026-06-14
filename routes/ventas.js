import express from 'express';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import { client } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

function coleccion() {
    return client.db(process.env.MONGO_DB).collection('ventas');
}

router.get('/', async (req, res) => {
    try {
        const ventas = await coleccion().find().toArray();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener ventas', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const venta = await coleccion().findOne({ _id: new ObjectId(req.params.id) });
        if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
        res.json(venta);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener venta', error: error.message });
    }
});

router.post('/usuario', async (req, res) => {
    try {
        const { id_usuario } = req.body;
        if (!id_usuario) return res.status(400).json({ mensaje: 'El campo id_usuario es requerido' });

        const ventas = await coleccion().find({ id_usuario: id_usuario.toString() }).toArray();
        if (ventas.length === 0) return res.status(404).json({ mensaje: 'No se encontraron ventas para ese usuario' });

        res.json(ventas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener ventas del usuario', error: error.message });
    }
});

router.post('/', verificarToken, async (req, res) => {
    try {
        const productosCol = client.db(process.env.MONGO_DB).collection('productos');

        for (const item of req.body.productos) {
            const producto = await productosCol.findOne({ id: item.id_producto });
            if (!producto) return res.status(404).json({ mensaje: `Producto no encontrado: ${item.id_producto}` });
            if (producto.stock < item.cantidad) return res.status(409).json({ mensaje: `Stock insuficiente para: ${producto.nombre}` });
        }

        for (const item of req.body.productos) {
            await productosCol.updateOne({ id: item.id_producto }, { $inc: { stock: -item.cantidad } });
        }

        const nueva = {
            ...req.body,
            id_usuario: req.usuario.id,
            fecha: new Date().toISOString()
        };
        const resultado = await coleccion().insertOne(nueva);
        res.status(201).json({ _id: resultado.insertedId, ...nueva });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear venta', error: error.message });
    }
});

router.put('/:id', verificarToken, async (req, res) => {
    try {
        const resultado = await coleccion().findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
            { returnDocument: 'after' }
        );
        if (!resultado) return res.status(404).json({ mensaje: 'Venta no encontrada' });
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar venta', error: error.message });
    }
});

router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const resultado = await coleccion().findOneAndDelete({ _id: new ObjectId(req.params.id) });
        if (!resultado) return res.status(404).json({ mensaje: 'Venta no encontrada' });
        res.json({ mensaje: 'Venta eliminada', venta: resultado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar venta', error: error.message });
    }
});

export default router;
