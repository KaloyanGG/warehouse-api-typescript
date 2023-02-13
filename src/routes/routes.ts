import dotenv from 'dotenv';
import { Express, Request, Response } from "express";
import { validateSchema } from "../middlewares/schema-validator";
import UserModel from "../models/user.model";
import userRegisterSchema from "../schemas/user-register.schema";
import bcrypt from 'bcrypt';
dotenv.config();


export function registerRoutes(app: Express) {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World!');
    });

    app.post('/api/auth/register', validateSchema(userRegisterSchema), async (req: Request, res: Response) => {
        try {
            const encrypted = await bcrypt.hash(req.body.password, Number(process.env.saltWorkFactor));
            const user = await UserModel.create({ username: req.body.username, password: encrypted });
            res.status(201).json({ user });
        } catch (error: any) {
            res.status(400).send({ error });
        }
    });
}