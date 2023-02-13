import express, { NextFunction, Request, Response } from 'express';
import mongoose from "mongoose";
import logger from './utils/logger';
import dotenv from 'dotenv';
import connectToMongoDB from './db/connect';
import UserModel from './models/user.model';
import userRegisterSchema from './schemas/user-register.schema';
import { z } from 'zod'
import { validateSchema } from './middlewares/schema-validator';
import { registerRoutes } from './routes/routes';


dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

app.listen(process.env.port, async () => {
    await connectToMongoDB();
    logger.warn(`Listening on port ${process.env.port}`); //3000

});





