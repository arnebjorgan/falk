import Joi from 'joi';
import { FieldType } from '../definitions';

const helper : FieldType<Date> = {
    typeString: 'date',
    parseFromQuery: (val : string) => {
        const parsed = new Date(val);
        try {
            return parsed.toISOString() === val ? parsed : val;
        } catch(e) {
            return val;
        }
    },
    validator: Joi.date().iso(),
    mongoDbType: Date,
    swaggerTypeString: 'string',
    swaggerFormatString: 'date-time',
}

export default helper;