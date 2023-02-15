import { Request, Response } from "express";
import ProductModel from "../model/product.model";
import { deleteAllProducts, deleteProductById } from "../service/products.service";


async function deleteHandler(req: Request, res: Response) {
    try {
        if (req.params.id) {
            const product = await deleteProductById(req.params.id);
            if (product) {
                return res.status(200).send({ message: 'Product deleted' });
            }
            return res.status(404).send({ message: 'Product not found' });
        } else {
            await deleteAllProducts();
            return res.status(200).send({ message: 'All products deleted' });
        }
    } catch (error) {
        res.status(400).send({ error });
    }
}

export { deleteHandler }