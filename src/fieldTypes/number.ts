import { z } from 'zod';
import { FieldType } from '../definitions';

const helper : FieldType<number> = {
    parseFromQuery: (val : string) => {
        return parseFloat(val);
    },
    validator: z.number(),
    mongoDbType: Number,
    swaggerTypeString: 'number',
}

export default helper;