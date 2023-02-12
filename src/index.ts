import express, { Request, Response } from 'express';
import mongoose from "mongoose";
import logger from './logger/logger';
import dotenv from 'dotenv';
import connectToMongoDB from './db/connect';
import UserModel from './model/user.model';
import userRegisterSchema from './schema/user-register.schema';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.listen(process.env.port, async () => {
    await connectToMongoDB();
    logger.warn(`Listening on port ${process.env.port}`); //3000

});

app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        // const validationResult = await userRegisterSchema.validateAsync(req.body);
        // res.send(validationResult);
        const user = await UserModel.create(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).send(error);
        // logger.error(error);
    }
});



