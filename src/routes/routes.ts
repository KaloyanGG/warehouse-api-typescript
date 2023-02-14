import dotenv from 'dotenv';
import { Express, request, Request, Response } from "express";
import { validateSchema } from "../middleware/schema-validator";
import userRegisterSchema from "../schema/user-register.schema";
import userLoginSchema from '../schema/user-login.schema';
import { loginHandler, registerHandler } from '../controller/auth.controller';

dotenv.config();
export function registerRoutes(app: Express) {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World!');
    });
    app.post('/auth/login', validateSchema(userLoginSchema), loginHandler);
    app.post('/auth/register', validateSchema(userRegisterSchema), registerHandler);
}