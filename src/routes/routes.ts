import dotenv from 'dotenv';
import { Express, request, Request, Response } from "express";
import { validateSchema } from "../middleware/schema-validator";
import userRegisterSchema from "../schema/user-register.schema";
import userLoginSchema from '../schema/user-login.schema';
import { authenticateUser, loginHandler, logout, mySelf, registerHandler, renewTokenHandler } from '../controller/auth.controller';
import ProductModel from '../model/product.model';
import productAddSchema from '../schema/product-add.schema';
import { addProductHandler, deleteHandler, getProductByIdHandler, updateHandler } from '../controller/products.controller';
import productUpdateSchema from '../schema/product-update.schema';
import { getAllProductsHandler } from '../controller/products.controller';
import logger from '../utils/logger';

export function registerRoutes(app: Express) {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World!');
    });

    // app.get('/products', authenticateUser, getAllProductsHandler);
    app.get('/products', getAllProductsHandler);
    // app.get('/products/:id',authenticateUser, getProductByIdHandler)
    app.get('/products/:id', getProductByIdHandler);

    app.post('/auth/login', validateSchema(userLoginSchema), loginHandler);
    app.post('/auth/register', validateSchema(userRegisterSchema), registerHandler);
    app.post('/products', validateSchema(productAddSchema), addProductHandler);
    app.post('/auth/token', renewTokenHandler);
    app.delete('/products', deleteHandler);
    app.delete('/products/:id', deleteHandler);
    app.put('/products/:id', validateSchema(productUpdateSchema), updateHandler);

    app.get('/wait', (req: Request, res: Response) => {
        setTimeout(() => {
            res.json('viktor pederasa');
        }, 3000);
    });

    app.post('/auth/logout', logout)
    app.get('/me', mySelf);

}
