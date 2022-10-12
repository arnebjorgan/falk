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
    validator: Joi.date(),
    mongoDbType: Date,
    swaggerTypeString: 'string',
    swaggerFormatString: 'date-time',
    swaggerReadonly: true,
    autoField: {
        getCreateValue() { return new Date() },
    },
}

export default helper;