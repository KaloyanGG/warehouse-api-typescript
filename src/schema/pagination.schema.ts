import { z } from 'zod';

const paginationQueryParamsSchema = z.object({
    page: z.number().positive().int(),
    limit: z.number().positive().int()
}).strict();

export default paginationQueryParamsSchema;
