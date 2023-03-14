import { Express, Request, Response } from "express";
import { validateSchema } from "../middleware/schema-validator";
import userRegisterSchema from "../schema/user-register.schema";
import userLoginSchema from '../schema/user-login.schema';
import { loginHandler, logout, mySelf, registerHandler, renewTokenHandler } from '../controller/auth.controller';
import productAddSchema from '../schema/product-add.schema';
import { addProductHandler, deleteHandler, getProductByIdHandler, updateHandler } from '../controller/products.controller';
import productUpdateSchema from '../schema/product-update.schema';
import { getAllProductsHandler } from '../controller/products.controller';
import logger from '../utils/logger';
import { UploadedFile } from "express-fileupload";

import base64 from 'base64-js';
import path from 'path';
import fs from 'fs';


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


    function saveFileFromBase64(base64Data: string, fileName: string) {
        const fileData = base64.toByteArray(base64Data);
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, fileData);
    }

    app.post('/testFileUpload', (req: Request, res: Response) => {

        console.log(req.body.ph);
        res.json('hello');

        try {
            saveFileFromBase64(req.body.ph, 'test.jpg');
        } catch (err) {
            logger.fatal(err);
        }

        // let sampleFile;
        // let uploadPath;

        // if (!req.files || Object.keys(req.files).length === 0) {
        //     return res.status(400).send('No files were uploaded.');
        // }

        // sampleFile = req.files.photo as UploadedFile;
        // uploadPath = '../../photos-of-products/' + sampleFile.name;

        // sampleFile.mv(uploadPath, function (err: any) {
        //     if (err)
        //         return res.status(500).send(err);

        //     res.send('File uploaded!');
        // });


    });

}
