import { NextFunction, Request, Response } from "express";
import UserModel from "../model/user.model";
import bcrypt from 'bcrypt';
import { hasBothCookies, hasBothTokens, signAccessAndRefreshTokens, signToken, validatePassword, verifyAccessAndRefreshTokens } from '../service/auth.service';
import { verify } from 'jsonwebtoken';
import logger from '../utils/logger';
import dotenv from 'dotenv';
import transformJwtTimeToSeconds from "../utils/jwtToString";

dotenv.config();

async function loginHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);
    const tokens = signAccessAndRefreshTokens(user);
    if (user && tokens) {
        res.status(200);
        res.cookie('accessToken', tokens.accessToken, { httpOnly: true, maxAge: transformJwtTimeToSeconds(process.env.accessTokenTtl!) });
        res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, maxAge: transformJwtTimeToSeconds(process.env.refreshTokenTtl!) });
        res.status(200).json({ username: user.username });
    } else {
        res.sendStatus(401);
    }
}


async function registerHandler(req: Request, res: Response) {
    try {
        const user = await UserModel.findOne({ username: req.body.username });
        if (user) {
            return res.status(409).send({ message: 'User with this username already exists' });
        }
        const encrypted = await bcrypt.hash(req.body.password, Number(process.env.saltWorkFactor));

        await UserModel.create({ username: req.body.username, password: encrypted });

        res.status(201).json({ user });
    } catch (error: any) {
        logger.error(error);
        res.status(400).send(error);
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
        //jwt.verify
        verify(accessToken as any, process.env.privateKey!);
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            const refreshToken = req.headers['x-refresh'];
            try {
                //jwt.verify
                const decoded = verify(refreshToken as any, process.env.privateKey!) as any;
                const accessExpiresIn = process.env.accessTokenTtl;
                const accessToken = signToken({ username: decoded.username }, { expiresIn: accessExpiresIn });
                res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: transformJwtTimeToSeconds(process.env.accessTokenTtl!) });
                return res.status(200).json({ username: decoded.username });
            } catch (error) {
                // logger.error(err);
                return res.sendStatus(401);
            }
        }
        logger.error(err);
        res.status(401).send(err);

    }
}

function mySelf(req: Request, res: Response) {
    const requestWithBothCookies = hasBothCookies(req);
    if (!requestWithBothCookies ||
        !verifyAccessAndRefreshTokens(requestWithBothCookies)) {
        return res.sendStatus(401);
    }

    try {
        const decoded = verify(req.cookies.accessToken, process.env.privateKey!) as any;
        return res.status(200).json({ username: decoded.username });
    } catch (err: any) {
        console.log(err);
    }
}

function logout(req: Request, res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.sendStatus(200);
}

export { logout, mySelf, loginHandler, registerHandler, authenticateUser, renewTokenHandler };