import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function validateSchema(schema: z.ZodEffects<any> | z.ZodObject<any>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validationResult = await schema.parseAsync(req.body);
            next();
        } catch (error: any) {
            res.status(400).send(error);
        }
    }
}