import dotenv from 'dotenv';
import { Express, request, Request, Response } from "express";
import { validateSchema } from "../middleware/schema-validator";
import userRegisterSchema from "../schema/user-register.schema";
import userLoginSchema from '../schema/user-login.schema';
import { loginHandler, registerHandler } from '../controller/auth.controller';
import ProductModel from '../model/product.model';
import productAddSchema from '../schema/product-add.schema';
import { deleteHandler } from '../controller/products.controller';

dotenv.config();
export function registerRoutes(app: Express) {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World!');
    });
    app.post('/auth/login', validateSchema(userLoginSchema), loginHandler);
    app.post('/auth/register', validateSchema(userRegisterSchema), registerHandler);

    app.post('/products', validateSchema(productAddSchema), async (req: Request, res: Response) => {
        try {
            const product = await ProductModel.create(req.body);
            res.status(201).json({ product });
        } catch (error) {
            res.status(400).send({ error });
        }
    });

    app.delete('/products', deleteHandler);
    app.delete('/products/:id', deleteHandler);

}