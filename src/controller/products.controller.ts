import { Request, Response } from "express";
import ProductModel from "../model/product.model";
import { deleteAllProducts, deleteProductById } from "../service/products.service";
import logger from "../utils/logger";
import paginationQueryParamsSchema from "../schema/pagination.schema";
import { UploadedFile } from "express-fileupload";
import { saveFileFromBase64, toBase64 } from "../utils/file-utils";
import dotenv from 'dotenv';
import _ from "lodash";
import fs from "fs";
import { LeanDocument, Types } from "mongoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";

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
        res.send((await ProductModel.find({}).lean()).map((product) => {

            const result = _.omit(product, ['photoPath']) as any;
            const photoData = fs.readFileSync(product.photoPath as string);
            const photoBase64 = photoData.toString('base64');
            result.photo = photoBase64;
            return result;
        }));
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
        const updatesToSave = _.omit(req.body, ['photo']);

        if (req.body.photo) {
            const photoPath = process.env.photosPath + req.body.name + '.png';
            updatesToSave.photoPath = photoPath;
            saveFileFromBase64(req.body.photo, req.body.name + '.png');
        }
        const result = await ProductModel.findByIdAndUpdate(id, updatesToSave, { new: true });
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
        // console.log();
        // res.sendStatus(200);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.sendStatus(409);
        }
        logger.error(error);
        res.status(400).send({ error });
    }
}

async function getProductByIdHandler(req: Request, res: Response) {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const productToSend = _.omit(product.toObject(), ['photoPath', 'createdAt', 'updatedAt']);
        const photoData = fs.readFileSync(product.photoPath as string);
        const photoBase64 = photoData.toString('base64');
        (productToSend as any).photo = photoBase64;
        res.status(200).json(productToSend);
    } catch (error) {
        logger.error(error);
        res.sendStatus(404);
    }
}

export { addProductHandler, getAllProductsHandler, deleteHandler, updateHandler, getProductByIdHandler }