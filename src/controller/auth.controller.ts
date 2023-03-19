import { NextFunction, Request, Response } from "express";
import UserModel from "../model/user.model";
import bcrypt from 'bcrypt';
import { hasBothCookies, hasBothTokens, setBothCookies, signAccessAndRefreshTokens, signToken, validatePassword, verifyAccessAndRefreshTokens } from '../service/auth.service';
import { verify } from 'jsonwebtoken';
import logger from '../utils/logger';
import dotenv from 'dotenv';
import transformJwtTimeToSeconds from "../utils/jwtToString";
import NewPasswordTokenModel from "../model/newPasswordToken.model";
import randomString from 'randomstring';
import sgMail from '@sendgrid/mail';


dotenv.config();

async function loginHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);
    const tokens = signAccessAndRefreshTokens(user);
    if (user && tokens) {
        res.status(200);
        setBothCookies(res, tokens);
        res.status(200).json({ username: user.username });
    } else {
        res.sendStatus(401);
    }
}

async function registerHandler(req: Request, res: Response) {
    try {
        const user = await UserModel.findOne({ username: req.body.username });
        const user2 = await UserModel.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).send({ message: 'User with this username already exists' });
        }
        if (user2) {
            return res.status(409).send({ message: 'User with this email already exists' });
        }
        const encrypted = await bcrypt.hash(req.body.password, Number(process.env.saltWorkFactor));
        await UserModel.create({
            username: req.body.username,
            email: req.body.email,
            password: encrypted,
            phoneNumber: req.body.phoneNumber
        });
        res.status(201).send({ message: 'User created' });
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

    const refreshToken = req.cookies.refreshToken;
    try {
        const decoded = verify(refreshToken as any, process.env.privateKey!) as any;
        const accessExpiresIn = process.env.accessTokenTtl;
        const accessToken = signToken({ username: decoded.username }, { expiresIn: accessExpiresIn });
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: transformJwtTimeToSeconds(process.env.accessTokenTtl!) });
        return res.status(200).json({ username: decoded.username });
    } catch (error) {
        logger.error(error);
        return res.sendStatus(401);
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

async function resetPasswordTokenHandler(req: Request, res: Response) {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send({ message: 'Email is required' });
    }
    const user = await UserModel.findOne({ email: email }).lean();
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    const token = randomString.generate(16);
    await NewPasswordTokenModel.create({
        userId: user._id,
        token: token,
        //5 minute
        expirationDate: new Date(Date.now() + 300000)
    });
    logger.info(`Token created for user ${user.username} with email ${user.email}`);

    sgMail.setApiKey(process.env.sendgridApiKey!);

    const message = {
        to: `${user.email}`,
        from: 'kokicha.gg@gmail.com',
        subject: 'Forgotten password',
        html: `<strong>Click here to reset your password: <a href="http://localhost:3001/resetPassword/${token}">LINK HERE</a> </strong>`,
    };

    sgMail.send(message)
        .then((response) => {
            logger.info('Email sent...');
            res.status(200).send({ message: 'Email sent' });
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).send({ message: 'Error sending email' });
        });
}

async function resetPasswordHandler(req: Request, res: Response) {

    const password = req.body.password;
    const token = req.body.token;
    if (!password || !token) {
        return res.status(400).send({ message: 'Password and token are required' });
    }

    const tokenEntity = await NewPasswordTokenModel.findOne({ token: token }).lean();
    if (!tokenEntity) {
        return res.status(404).send({ message: 'Token not found' });
    }
    const now = new Date();
    if (now > tokenEntity.expirationDate) {
        return res.status(400).send({ message: 'Token expired' });
    }

    const newPassword = bcrypt.hashSync(password, Number(process.env.saltWorkFactor));
    const user = await UserModel.findByIdAndUpdate(tokenEntity.userId, { password: newPassword }, { new: true }).lean();

    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    await NewPasswordTokenModel.deleteOne({ token: token });
    return res.status(200).send({ message: 'Password changed successfully' });


}

export { resetPasswordHandler, resetPasswordTokenHandler, logout, mySelf, loginHandler, registerHandler, authenticateUser, renewTokenHandler };