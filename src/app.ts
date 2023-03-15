import express, { NextFunction, Request, Response } from 'express';
import mongoose from "mongoose";
import logger from './utils/logger';
import dotenv from 'dotenv';
import connectToMongoDB from './db/connect';
import { registerRoutes } from './routes/routes';
import ProductModel from './model/product.model';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();

// app.use(cors());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3001' // from where the requests are coming
}));


app.use(bodyParser.json({ limit: '10mb' }));

// app.use(fileUpload());


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

app.listen(process.env.port, async () => {
    await connectToMongoDB();
    logger.info(`Listening on port ${process.env.port}`); //3000
});

// todo hash the private key
// todo cors
// Контролерът само да приеме данните и да ги върне, не сървиcа.
// <> - generic
// tests


app.post('/addProducts', addSomeProducts);
async function addSomeProducts(req: Request, res: Response) {
    await addTenProducts(req, res);
}

async function addTenProducts(req: Request, res: Response) {
    const products = [];
    for (let i = 1; i <= 10; i++) {
        products.push({
            name: `product ${i}`,
            buyPrice: 10 * i,
            sellPrice: 11 * i,
            photoPath: `${process.env.photosPath}\kitty.png`,
            type: 'Хранителни стоки',
            count: 25 * i,
            description: 'Описание на продукт ' + i + ' A warehouse product could be a pallet of electronics components that are being stored in a temperature-controlled environment until they are ready to be assembled into finished products.',

        });
    }
    try {
        await ProductModel.insertMany(products);
        res.status(200).send({ message: 'Products added' });
    } catch (err) {
        res.send(err);
    }
}






