import { z } from 'zod';
import { FieldType } from '../definitions';

const helper : FieldType<string> = {
    parseFromQuery: (val : string) => {
        return val;
    },
    validator: z.string(),
    mongoDbType: String,
    swaggerTypeString: 'string',
}

export default helper;