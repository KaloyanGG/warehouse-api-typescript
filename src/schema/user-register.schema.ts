import joi from 'joi';

const userRegisterSchema = joi.object({
    //validate with regex:
    username: joi.string().required().regex(/^[a-zA-Z_]{5,50}$/),
    password: joi.string().required(),
});

export default userRegisterSchema;