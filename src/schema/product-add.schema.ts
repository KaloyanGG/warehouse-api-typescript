import { z } from 'zod';

const productAddSchema = z.object({

    name: z.string().max(50),
    description: z.string().max(2000).optional(),
    photo: z.string(),
    buyPrice: z.number().positive(),
    sellPrice: z.number().positive(),
    count: z.number().min(0),
    type: z.enum(['Хранителни стоки', 'Канцеларски материали', 'Строителни материали'])
}).strict();

export default productAddSchema;
