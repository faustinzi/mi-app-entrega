import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import ProductManager from '../ProductManager.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsRouter = Router();

const productManager = new ProductManager(path.join(__dirname, '../../persistance/products.json'));


// GET /api/products/ - Obtener todos los productos
productsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'No se pudieron obtener los productos.' });
    }
});

// GET /api/products/:pid - Obtener producto por ID
productsRouter.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado.' });
        }
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ error: 'No se pudo obtener el producto.' });
    }
});

// POST /api/products/ - Agregar un nuevo producto
productsRouter.post('/', async (req, res) => {
    try {
        const { title,description,code,price,status,stock,category,thumbnails } = req.body;

        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).json({ error: 'La descripción del producto debe ser un string.' });
        }
        if (code !== undefined && typeof code !== 'string') {
            return res.status(400).json({ error: 'El código del producto debe ser un string.' });
        }
        if (price !== undefined && (typeof price !== 'number' || price < 0)) {
            return res.status(400).json({ error: 'El precio del producto debe ser un número no negativo.' });
        }
        if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
            return res.status(400).json({ error: 'El stock del producto debe ser un número no negativo.' });
        }
        if (category !== undefined && typeof category !== 'string') {
            return res.status(400).json({ error: 'La categoría del producto debe ser un string.' });
        }

        if (thumbnails !== undefined) { 
            if (!Array.isArray(thumbnails)) {
                return res.status(400).json({ error: 'Los "thumbnails" del producto deben ser un array de strings.' });
            }
            for (const thumb of thumbnails) {
                if (typeof thumb !== 'string') {
                    return res.status(400).json({ error: 'Cada "thumbnail" debe ser una ruta de imagen en formato string.' });
                }
            }
        }

        const newProduct = await productManager.addProduct(title,description,code,price,status,stock,category);

        res.status(201).json({
            message: 'Producto agregado exitosamente.',
            product: newProduct
        });
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'No se pudo agregar el producto.' });
    }
});

// PUT /api/products/:pid - Actualizar un producto por ID
productsRouter.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const { title,description,code,price,status,stock,category,thumbnails } = req.body;

        const updatedProduct = await productManager.updateProduct(productId, { title,description,code,price,status,stock,category,thumbnails });

        if (updatedProduct) {
            res.status(200).json({
                message: `Producto con ID ${productId} actualizado exitosamente.`,
                product: updatedProduct
            });
        } else {
            res.status(404).json({ error: `Producto con ID ${productId} no encontrado.` });
        }
    } catch (error) {
        console.error('Error al actualizar producto por ID:', error);
        res.status(500).json({ error: 'No se pudo actualizar el producto.' });
    }
});

// DELETE /api/products/:pid - Eliminar un producto por ID
productsRouter.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const deletedProduct = await productManager.deleteProduct(productId);

        if (deletedProduct) {
            res.status(200).json({
                message: `Producto con ID ${productId} eliminado exitosamente.`,
                product: deletedProduct
            });
        } else {
            res.status(404).json({ error: `Producto con ID ${productId} no encontrado.` });
        }
    } catch (error) {
        console.error('Error al eliminar producto por ID:', error);
        res.status(500).json({ error: 'No se pudo eliminar el producto.' });
    }
});

export default productsRouter; // Exporta el enrutador