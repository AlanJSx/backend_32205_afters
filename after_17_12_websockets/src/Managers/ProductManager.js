import fs from "fs";
import { NotFoundError, ValidationError } from "../utils/index.js";

class ProductManagerFilesystem {
  // nos pide que la clase reciba la ruta / path del archivo donde guardaremos los productos
  constructor(path) {
    // en el constructor podemos inicializar variables de la clase, y darle un valor, cada instancia tendra el suyo
    this.path = path;

    // Para invocar el método al crear la instancia, podemos llamarlo desde acá
    this.#init();
  }

  // Podemos definir un primer metodo para saber si el archivo en ese path existe, y que si no, se cree al iniciar la instancia
  #init() {
    try {
      const existFile = fs.existsSync(this.path);
      if (existFile) return;

      // Si no existe, ya lo inicializamos con un array vacio
      fs.writeFileSync(this.path, JSON.stringify([]));
    } catch (error) {
      console.log(error);
    }
  }

  #writeFile(data) {
    return fs.promises.writeFile(this.path, JSON.stringify(data, null, 3));
  }

  // Definimos uno de los métodos solicitados
  async getProducts() {
    try {
      // leemos el archivo (asumiendo que existe, o podriamos verificarlo)
      // y convertimos la respuesta a JS con JSON.parse
      const response = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(response);
    } catch (error) {
      console.log(error);
    }
  }

  async getById(id) {
    const products = await this.getProducts();

    const productFound = products.find((product) => product.id === id);

    return productFound;
  }

  async saveProduct({ title, description, price, code }) {
    const newProduct = { title, description, price, code };
    // vamos a buscar el array de products, para no hacer el readfile aca podemos reutilizar el metodo getProducts
    const products = await this.getProducts();

    const existCodeInProducts = products.some(
      (product) => product.code === code
    );

    if (existCodeInProducts)
      throw new ValidationError("Code should be different");

    newProduct.id = !products.length ? 1 : products[products.length - 1].id + 1;

    products.push(newProduct);

    // await fs.promises.writeFile(this.path, JSON.stringify(products, null, 3));
    await this.#writeFile(products);

    return newProduct;
  }

  async update({ id, newData }) {
    const products = await this.getProducts();

    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) throw new NotFoundError("Product not found");

    const product = products[productIndex];

    // no sería la mejor forma de actualizar
    products[productIndex] = { ...product, ...newData };

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 3));

    return products[productIndex];
  }

  async deleteProduct(id) {
    const products = await this.getProducts();

    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) throw new NotFoundError("Product not found");

    // splice modifica el array original y devuelve el elemento eliminado (podriamos usar filter)
    const deletedProduct = products.splice(productIndex, 1);

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 3));

    return deletedProduct[0];
  }
}

export { ProductManagerFilesystem };
