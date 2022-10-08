import Joi from 'joi';
import { FieldType } from '../definitions';
//TODO
const helper : FieldType = {
    parseFromQuery: (val : string) => {
        return val;
    },
    validator: Joi.string(),
    mongoDbType: String,
    swaggerTypeString: 'string',
}

export default helper;