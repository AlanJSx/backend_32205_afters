import { Router } from "express";
import { ERRORS } from "../consts/index.js";
import { productManager } from "../Managers/index.js";

const router = Router();

/// este router, arranca en /api/products
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;

    const allProducts = await productManager.getProducts();

    if (limit < 1 || limit > allProducts.length) {
      return res.send({ success: true, products: allProducts });
    }

    // agregar skip para hacer un "paginado"
    const products = allProducts.slice(0, limit);

    return res.send({ success: true, products });
  } catch (error) {
    console.log(error);

    res.send({ success: false, error: "Ha ocurrido un error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id: paramId } = req.params;
    const id = Number(paramId);
    // como solo estamos usando numeros para el id podriamos verificar
    if (id < 0) {
      return res.send({
        success: false,
        error: "El id debe ser un número válido",
      });
    }

    const product = await productManager.getById(id);

    if (!product) {
      return res.send({ success: false, error: "Producto no encontrado" });
    }

    res.send({ success: true, product });
  } catch (error) {
    console.log(error);

    res.send({ success: false, error: "Ha ocurrido un error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, price, code } = req.body;

    // alguna validacion (podriamos usar joi, lo voy a explicar en otro after)
    if (!title || !description || !price || !code)
      return res.send({
        success: false,
        error: "Las variables son obligatorias",
      });

    const savedProduct = await productManager.saveProduct({
      title,
      description,
      price,
      code,
    });

    req.app
      .get("io")
      .sockets.emit(
        "hello",
        "hola! posteaste un producto, te hablo desde product router!"
      );

    req.app
      .get("io")
      .sockets.emit("products", await productManager.getProducts());

    return res.send({ success: true, product: savedProduct });
  } catch (error) {
    console.log(error);

    if (error.name === ERRORS.VALIDATION_ERROR) {
      return res.send({
        success: false,
        error: { [error.name]: error.message },
      });
    }

    res.send({
      success: false,
      error: "Ha ocurrido un error",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id: paramId } = req.params;
    const id = Number(paramId);
    if (id < 0) {
      return res.send({
        success: false,
        error: "El id debe ser un número válido",
      });
    }

    const { title, description, price, code } = req.body;

    const updatedProduct = await productManager.update({
      id,
      newData: { title, description, price, code },
    });

    return res.send({ success: true, product: updatedProduct });
  } catch (error) {
    console.log(error);
    if (error.name === ERRORS.NOT_FOUND)
      return res.send({
        success: false,
        error: `${error.name}: ${error.message}`,
      });

    res.send({
      success: false,
      error: "Ha ocurrido un error",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id: paramId } = req.params;
    const id = Number(paramId);
    if (id < 0) {
      return res.send({
        success: false,
        error: "El id debe ser un número válido",
      });
    }

    const deletedProduct = await productManager.deleteProduct(id);

    res.send({
      success: true,
      deleted: deletedProduct,
    });
  } catch (error) {
    console.log(error);
    if (error.name === ERRORS.NOT_FOUND)
      return res.send({
        success: false,
        error: `${error.name}: ${error.message}`,
      });

    res.send({
      success: false,
      error: "Ha ocurrido un error",
    });
  }
});

export { router as productsRouter };
