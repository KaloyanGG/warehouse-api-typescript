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

try {
    registerRoutes(app);
    app.listen(process.env.port, async () => {
        await connectToMongoDB();
        logger.info(`Listening on port ${process.env.port}`); //3000
    });

} catch (err) {
    logger.error(err);
    throw err;
}


// todo hash the private key
// todo cors
// Контролерът само да приеме данните и да ги върне, не сървиcа.
// <> - generic
// tests








