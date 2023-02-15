import jwt from 'jsonwebtoken';
import UserModel from '../model/user.model';
import bcrypt from 'bcrypt';

function signToken(payload: any, options: jwt.SignOptions | undefined) {
    const secret = process.env.privateKey as string;
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

export { signToken, validatePassword };