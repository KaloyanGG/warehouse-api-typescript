import { Request, Response } from "express";
import ProductModel from "../model/product.model";
import { deleteAllProducts, deleteProductById } from "../service/products.service";
import logger from "../utils/logger";

async function getAllProductsHandler(req: Request, res: Response) {
    res.send(await ProductModel.find({}));
}

async function deleteHandler(req: Request, res: Response) {
    try {
        if (req.params.id) {
            const product = await deleteProductById(req.params.id);
            if (product) {
                res.status(200).send({ message: 'Product deleted' });
            }
            res.status(404).send({ message: 'Product not found' });
        } else {
            await deleteAllProducts();
            return res.status(200).send({ message: 'All products deleted' });
        }
    } catch (error) {
        res.status(400).send({ error });
    }
}

async function updateHandler(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const updates = req.body;
        const result = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
        if (!result) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(result);
    } catch (err: any) {
        logger.error(err);
        if (err.codeName === 'DuplicateKey') {
            return res.status(409).send({ message: 'Product with this name already exists' });
        }
        res.status(500).send({ err });
    }
}

export { getAllProductsHandler, deleteHandler, updateHandler }