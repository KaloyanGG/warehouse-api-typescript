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
        // res.status(200).json(tokens);
        res.status(200);
        // res.cookie('accessToken', tokens.accessToken, { sameSite: "none", secure: true, maxAge: transformJwtTimeToSeconds(process.env.accessTokenTtl as string) });
        // res.cookie('refreshToken', tokens.refreshToken, { sameSite: "none", secure: true, maxAge: transformJwtTimeToSeconds(process.env.refreshTokenTtl as string) });
        res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } else {
        res.sendStatus(401);
    }
}
function transformJwtTimeToSeconds(jwtTime: string): number {
    const time = jwtTime.match(/\d+/g);
    if (!time) return 0;
    const unit = jwtTime.match(/[a-zA-Z]+/g);
    if (!unit) return 0;
    const seconds = time.reduce((acc, curr, index) => {
        switch (unit[index]) {
            case 's':
                return acc + Number(curr);
            case 'm':
                return acc + Number(curr) * 60;
            case 'h':
                return acc + Number(curr) * 60 * 60;
            case 'd':
                return acc + Number(curr) * 60 * 60 * 24;
            case 'w':
                return acc + Number(curr) * 60 * 60 * 24 * 7;
            default:
                return acc;
        }
    }, 0);
    return seconds * 1000;
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