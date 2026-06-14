import express from 'express';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import { client } from '../db.js';

dotenv.config();

const router = express.Router();

function coleccion() {
    return client.db(process.env.MONGO_DB).collection('productos');
}

router.get('/', async (req, res) => {
    try {
        const productos = await coleccion().find().toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const producto = await coleccion().findOne({ _id: new ObjectId(req.params.id) });
        if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener producto', error: error.message });
    }
});

router.post('/filtrar', async (req, res) => {
    try {
        const { categoria, precioMin, precioMax, disponible } = req.body;
        const filtro = {};

        if (categoria) filtro.categoria = categoria;
        if (disponible !== undefined) filtro.disponible = disponible;
        if (precioMin !== undefined || precioMax !== undefined) {
            filtro.precio = {};
            if (precioMin !== undefined) filtro.precio.$gte = precioMin;
            if (precioMax !== undefined) filtro.precio.$lte = precioMax;
        }

        const productos = await coleccion().find(filtro).toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al filtrar productos', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const resultado = await coleccion().insertOne(req.body);
        res.status(201).json({ _id: resultado.insertedId, ...req.body });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const resultado = await coleccion().findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
            { returnDocument: 'after' }
        );
        if (!resultado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const _id = new ObjectId(req.params.id);

        const estaEnVentas = await client.db(process.env.MONGO_DB)
            .collection('ventas')
            .findOne({ 'productos.id_producto': _id });

        if (estaEnVentas) {
            return res.status(409).json({ mensaje: 'No se puede eliminar el producto porque está asociado a una o más ventas' });
        }

        const resultado = await coleccion().findOneAndDelete({ _id });
        if (!resultado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json({ mensaje: 'Producto eliminado', producto: resultado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
    }
});

export default router;
