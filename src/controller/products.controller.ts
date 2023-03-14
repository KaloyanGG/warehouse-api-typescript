import { Request, Response } from "express";
import ProductModel from "../model/product.model";
import { deleteAllProducts, deleteProductById } from "../service/products.service";
import logger from "../utils/logger";
import paginationQueryParamsSchema from "../schema/pagination.schema";
import { UploadedFile } from "express-fileupload";
import { saveFileFromBase64 } from "../utils/saveFileFromBase63";
import dotenv from 'dotenv';
dotenv.config();

async function getAllProductsHandler(req: Request, res: Response) {

    if (Object.keys(req.query).length !== 0) {
        try {
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            await paginationQueryParamsSchema.parseAsync({ ...req.query, page, limit });
            res.send(await ProductModel.find({}).limit(limit).skip((page - 1) * limit).lean());
        } catch (err) {
            res.status(400).send(err);
        }
    } else {
        res.send(await ProductModel.find({}).lean());
    }

}

async function deleteHandler(req: Request, res: Response) {
    try {
        if (req.query.id) {
            const product = await deleteProductById(req.query.id as string);

            if (product) {
                return res.status(200).send({ message: 'Product deleted' });
            }
            res.status(404).send({ message: 'Product not found' });
        } else {
            await deleteAllProducts();
            return res.status(200).send({ message: 'All products deleted' });
        }
    } catch (error) {
        logger.error(error);
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


async function addProductHandler(req: Request, res: Response) {
    try {
        const product = await ProductModel.create({
            ...req.body,
            photoPath: req.body.photo
                ? process.env.photosPath + req.body.name + '.png'
                : process.env.photosPath + 'no-photo-available.png'
        });
        if (req.body.photo) {
            saveFileFromBase64(req.body.photo, req.body.name + '.png');
        }
        res.status(201).json({ product });
        // res.sendStatus(200);
    } catch (error) {
        logger.error(error);
        res.status(400).send({ error });
    }
}

async function getProductByIdHandler(req: Request, res: Response) {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        logger.error(error);
        res.sendStatus(404);
        // res.status(500).send({ error });
    }
}

export { addProductHandler, getAllProductsHandler, deleteHandler, updateHandler, getProductByIdHandler }