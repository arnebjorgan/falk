import { z } from 'zod';
import { FieldType } from '../definitions';

const helper : FieldType<Date> = {
    parseFromQuery: (val : string) => {
        return new Date(val);
    },
    validator: z.date(),
    mongoDbType: Date,
    swaggerTypeString: 'string',
    swaggerFormatString: 'date-time',
    swaggerReadonly: true,
    autoField: {
        getCreateValue() { return new Date() },
    },
}

export default helper;