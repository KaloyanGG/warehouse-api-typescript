import { z } from 'zod';

const productUpdateSchema = z.object({
    _id: z.string(),
    name: z.string().min(1).max(50).optional(),
    description: z.string().max(2000).optional(),
    photo: z.string().optional(),
    buyPrice: z.number().positive().optional(),
    sellPrice: z.number().positive().optional(),
    count: z.number().positive().optional(),
    type: z.enum(['Хранителни стоки', 'Канцеларски материали', 'Строителни материали']).optional()
}).strict();

export default productUpdateSchema;
