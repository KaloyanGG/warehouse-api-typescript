import jwt, { verify } from 'jsonwebtoken';
import UserModel from '../model/user.model';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

function signToken(payload: any, options: jwt.SignOptions | undefined) {
    const secret = process.env.privateKey!;
    return jwt.sign(payload, secret, options);
}
async function validatePassword({ username, password }: { username: string, password: string }) {
    const user = await UserModel.findOne({ username });
    if (user) {
        const isValid = await user.comparePassword(password);
        if (isValid) {
            return user;
        }
    }
    return null;
}

function hasBothTokens(req: Request): false | { accessToken: string, refreshToken: string } {
    const accessToken = req.headers['authorization'];
    const refreshToken = req.headers['x-refresh'] as string;
    if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
    }
    return false;
}
function hasBothCookies(req: Request): false | { accessToken: string, refreshToken: string } {

    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];
    if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
    }
    return false;

}
function verifyAccessAndRefreshTokens({ accessToken, refreshToken }: { accessToken: string, refreshToken: string }) {
    try {
        //jwt.verify
        verify(accessToken, process.env.privateKey!);
        verify(refreshToken, process.env.privateKey!);
        return true;
    } catch (error: any) {
        return false;
    }
}

function signAccessAndRefreshTokens(user: { username: string, password: string } | null) {
    if (!user) return null;
    try {
        const accessToken = signToken({ username: user.username }, { expiresIn: process.env.accessTokenTtl });
        const refreshToken = signToken({ username: user.username }, { expiresIn: process.env.refreshTokenTtl });
        return { accessToken, refreshToken };
    } catch (err: any) {
        return null;
    }
}

export { hasBothCookies, signToken, validatePassword, hasBothTokens, verifyAccessAndRefreshTokens, signAccessAndRefreshTokens };