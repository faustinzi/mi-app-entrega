import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {

    constructor(filePath) {
        this.path = path.resolve(filePath);
        this.products = [];
        this.lastId = 0;
        console.log('ProductManager intentando leer desde:', this.path);
    }

    async getProducts() {
        try {
            // Intenta leer el contenido del archivo de productos
            const data = await fs.readFile(this.path, 'utf8');
            // Parsea el contenido JSON a un array de JavaScript
            const products = JSON.parse(data);
            return products;
        } catch (error) {
            // Si el archivo no existe (ENOENT), devuelve un array vacío
            if (error.code === 'ENOENT') {
                console.log(`El archivo ${this.path} no existe. Se devolverá un array vacío.`);
                return [];
            }
            // Si hay un error al parsear el JSON, lo informa y devuelve un array vacío
            if (error instanceof SyntaxError) {
                console.error(`Error al parsear el archivo JSON en ${this.path}:`, error.message);
                return [];
            }
            // Para otros errores inesperados, los relanza
            console.error(`Error inesperado al leer el archivo ${this.path}:`, error);
            throw error;
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        const productsArray = Object.values(products);
        return productsArray.find(product => product.id === Number(id));
    }

    async addProduct(title="Default Title",description="Default Description",code="00000",price=99,status=true,stock=99,category="None",thumbnails=[]) {
        let products = await this.getProducts();

        const existingIds = products.map(product => product.id).sort((a, b) => a - b);

        let newId = 1;
        for (let i = 0; i < existingIds.length; i++) {
            if (existingIds[i] !== newId) {
                break;
            }
            newId++; 
        }

        const newProduct = {
            id: newId,
            title: title,
            description:description,
            price:price,
            status:status,
            stock: stock,
            category: category,
            thumbnails: thumbnails
        };

        products.push(newProduct);

        await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf8');

        return newProduct;
    }

    async deleteProduct(id) {
        let products = await this.getProducts(); 
        const productIdNum = Number(id); 

        const productToDelete = products.find(product => product.id === productIdNum);

        if (!productToDelete) {
            return undefined;
        }

        const newProducts = products.filter(product => product.id !== productIdNum);

        await fs.writeFile(this.path, JSON.stringify(newProducts, null, 2), 'utf8');

        return productToDelete;
    }

    async updateProduct(id, updates = {}) {
        let products = await this.getProducts();
        const productIdNum = Number(id);

        const productIndex = products.findIndex(product => product.id === productIdNum);

        if (productIndex === -1) {
            return undefined;
        }

        const productToUpdate = { ...products[productIndex] };

        if (updates.title !== undefined) {
            productToUpdate.title = updates.title;
        }
        if (updates.description !== undefined) {
            productToUpdate.description = updates.description;
        }
        if (updates.code !== undefined) {
            productToUpdate.code = updates.code;
        }
        if (updates.price !== undefined) {
            productToUpdate.price = updates.price;
        }
        if (updates.status !== undefined) {
            productToUpdate.status = updates.status;
        }
        if (updates.stock !== undefined) {
            productToUpdate.stock = updates.stock;
        }
        if (updates.category !== undefined) {
            productToUpdate.category = updates.category;
        }
        if (updates.thumbnails !== undefined) {
            productToUpdate.thumbnails = updates.thumbnails;
        }
        
        products[productIndex] = productToUpdate;

        await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf8');

        return productToUpdate;
    }
}

export default ProductManager