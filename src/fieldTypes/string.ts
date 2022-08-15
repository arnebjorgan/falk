import Joi from 'joi';
import { FieldTypeHelper } from '../definitions';

const helper : FieldTypeHelper = {
    parseFromQuery: (val : string) => {
        return val;
    },
    validator: Joi.string(),
    mongoDbType: String,
    swaggerTypeString: 'string',
}

export default helper;