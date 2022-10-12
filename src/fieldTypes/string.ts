import Joi from 'joi';
import { FieldType } from '../definitions';

const helper : FieldType<string> = {
    typeString: 'string',
    parseFromQuery: (val : string) => {
        return val;
    },
    validator: Joi.string(),
    mongoDbType: String,
    swaggerTypeString: 'string',
}

export default helper;