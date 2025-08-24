import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import CartManager from '../CartManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cartsRouter = Router();

const cartManager = new CartManager(path.join(__dirname, '../../persistance/carts.json'));


// POST /api/carts/ - Crear nuevo carrito
cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({
            message: 'Carrito creado exitosamente.',
            cart: newCart
        });
    } catch (error) {
        console.error('Error al crear el carrito:', error);
        res.status(500).json({ error: 'No se pudo crear el carrito.' });
    }
});

// GET /api/carts/:cid - Obtener todos los productos de un carrito específico
cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);

        if (cart) {
            res.json(cart.products); // Devuelve solo los productos del carrito
        } else {
            res.status(404).json({ error: `Carrito con ID ${cartId} no encontrado.` });
        }
    } catch (error) {
        console.error('Error al obtener productos del carrito:', error);
        res.status(500).json({ error: 'No se pudieron obtener los productos del carrito.' });
    }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito (aumenta quantity si ya existe)
cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const updatedCart = await cartManager.addProductToCart(cartId, productId);

        if (updatedCart) {
            res.status(200).json({
                message: `Producto ${productId} agregado/actualizado en carrito ${cartId} exitosamente.`,
                cart: updatedCart
            });
        } else {
            res.status(404).json({ error: `Carrito con ID ${cartId} no encontrado.` });
        }
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ error: 'No se pudo agregar el producto al carrito.' });
    }
});

export default cartsRouter;