import { z } from 'zod';
import userRegisterSchema from './user-register.schema';

const userLoginSchema = z.object({
    username: z.string().regex(/^[a-zA-Z_]{5,50}$/),
    password: z.string().min(6).max(20).refine((value) => {
        const regex = /(?=.*[A-Z])(?=.*[a-z])[A-Za-z]+/;
        if (!regex.test(value)) {
            return false;
        }
        if (!value.includes('@') && !value.includes('_') && !value.includes('~') && !value.includes('|') && !value.includes('-')) {
            return false;
        }
        return true;
    }, 'Password must contain at least one uppercase letter, one lowercase letter, one special character (@, _, ~, |, -)'),

}).strict();

export default userLoginSchema;