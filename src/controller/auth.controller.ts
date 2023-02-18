import { NextFunction, Request, Response } from "express";
import UserModel from "../model/user.model";
import bcrypt from 'bcrypt';
import { hasBothTokens, signAccessAndRefreshTokens, signToken, validatePassword, verifyAccessAndRefreshTokens } from '../service/auth.service';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

async function loginHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);
    const tokens = signAccessAndRefreshTokens(user);
    if (user && tokens) {
        res.status(200).json(tokens);
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
        logger.error(error);
        res.status(400).send({ error });
    }
}

function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const requestWithBothTokens = hasBothTokens(req);
    if (!requestWithBothTokens ||
        !verifyAccessAndRefreshTokens(requestWithBothTokens)) {
        return res.sendStatus(401);
    }
    next();
}

function renewTokenHandler(req: Request, res: Response) {
    try {
        const accessToken = req.headers['authorization'];
        jwt.verify(accessToken as any, process.env.privateKey as string);
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            const refreshToken = req.headers['x-refresh'];
            try {
                const decoded = jwt.verify(refreshToken as any, process.env.privateKey as string) as any;
                const accessExpiresIn = process.env.accessTokenTtl;
                const accessToken = signToken({ username: decoded.username }, { expiresIn: accessExpiresIn });
                return res.status(200).json({ accessToken });
            } catch (error) {
                // logger.error(err);
                return res.sendStatus(401);
            }
        }
        logger.error(err);
        res.status(401).send(err);

    }
}

export { loginHandler, registerHandler, authenticateUser, renewTokenHandler };