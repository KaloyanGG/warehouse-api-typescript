import { NextFunction, Request, Response } from "express";
import UserModel from "../model/user.model";
import bcrypt from 'bcrypt';
import { signToken, validatePassword } from '../service/auth.service';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import dotenv from 'dotenv';



dotenv.config();

async function loginHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);
    const accessExpiresIn = process.env.accessTokenTtl;
    const refreshExpiresIn = process.env.refreshTokenTtl;
    if (user) {
        const accessToken = signToken({ username: user.username }, { expiresIn: accessExpiresIn });
        const refreshToken = signToken({ username: user.username }, { expiresIn: refreshExpiresIn });
        res.status(200).json({ accessToken, refreshToken });
    } else {
        res.sendStatus(401);
    }
}

async function registerHandler(req: Request, res: Response) {
    try {
        const encrypted = await bcrypt.hash(req.body.password, Number(process.env.saltWorkFactor));
        const user = await UserModel.create({ username: req.body.username, password: encrypted });
        res.status(201).json({ user });
    } catch (error: any) {
        res.status(400).send({ error });
    }
}

function authenticateUser(req: Request, res: Response, next: NextFunction) {

    const accessToken = req.headers['authorization'];

    if (!accessToken) {
        return res.sendStatus(401);
    }

    try {
        const ver = jwt.verify(accessToken, process.env.privateKey as string);
        next();
    } catch (error: any) {
        return res.status(401).send(error);
    }
}

export { loginHandler, registerHandler, authenticateUser };