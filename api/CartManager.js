import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class CartManager {

    constructor(filePath) {
        this.path = filePath;
    }

    async getCartData() {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            const carts = JSON.parse(data);

            return Array.isArray(carts) ? carts : [];
        } catch (error) {

            if (error.code === 'ENOENT' || error instanceof SyntaxError) {
                return [];
            }

            console.error(`Error inesperado al leer el archivo ${this.path}:`, error);
            throw error;
        }
    }

    async saveCarts(carts) {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2), 'utf8');
    }

    async createCart() {
        let carts = await this.getCartData();

        let newId = 1;
        if (carts.length > 0) {
            const maxId = Math.max(...carts.map(cart => cart.id));
            newId = maxId + 1;
        }

        const newCart = {
            id: newId,
            products: []
        };

        carts.push(newCart);
        await this.saveCarts(carts); 

        return newCart;
    }

    async getCartById(id) {
        const carts = await this.getCartData();
        return carts.find(cart => cart.id === Number(id));
    }

    async addProductToCart(cartId, productId) {
        let carts = await this.getCartData();
        const cartIndex = carts.findIndex(cart => cart.id === Number(cartId));

        if (cartIndex === -1) {
            return undefined; 
        }

        const cartToUpdate = { ...carts[cartIndex] }; 

        const productInCartIndex = cartToUpdate.products.findIndex(p => p.product === Number(productId));

        if (productInCartIndex !== -1) {
            cartToUpdate.products[productInCartIndex].quantity += 1;
        } else {
            cartToUpdate.products.push({ product: Number(productId), quantity: 1 });
        }

        carts[cartIndex] = cartToUpdate;
        await this.saveCarts(carts);

        return cartToUpdate;
    }
}

export default CartManager;