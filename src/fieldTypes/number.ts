import Joi from 'joi';
import { FieldType } from '../definitions';

const helper : FieldType<number> = {
    typeString: 'number',
    parseFromQuery: (val : string) => {
        const parsed = parseFloat(val);
        return parsed.toString() === val ? parsed : val;
    },
    validator: Joi.number(),
    mongoDbType: Number,
    swaggerTypeString: 'number',
}

export default helper;