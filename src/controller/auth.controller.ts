import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import UserModel from "../model/user.model";
import bcrypt from 'bcrypt';


async function loginHandler(req: Request, res: Response) {
    const user = await UserModel.findOne({ username: req.body.username });
    const secret = process.env.privateKey as string;
    const accessExpiresIn = process.env.accessTokenTtl;
    const refreshExpiresIn = process.env.refreshTokenTtl;
    let accessToken = null;
    let refreshToken = null;
    if (user) {
        const accessToken = jwt.sign({ username: user.username }, secret, { expiresIn: accessExpiresIn });
        const refreshToken = jwt.sign({ username: user.username }, secret, { expiresIn: refreshExpiresIn });
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

export { loginHandler, registerHandler };