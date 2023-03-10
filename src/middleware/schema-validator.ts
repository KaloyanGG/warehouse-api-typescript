import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import logger from "../utils/logger";

export function validateSchema(schema: z.ZodEffects<any> | z.ZodObject<any>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error: any) {
            logger.error(error);
            res.status(400).send(error);
        }
    }
}