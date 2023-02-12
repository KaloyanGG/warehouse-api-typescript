import express, { Request, Response } from 'express';
import mongoose from "mongoose";
import logger from './logger/logger';
import dotenv from 'dotenv';
import connectToMongoDB from './db/connect';

dotenv.config();

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Worldd!');
});

app.listen(process.env.port, async () => {
    await connectToMongoDB();
    logger.warn(`Listening on port ${process.env.port}`);

});



