import Joi from 'joi';
import { FieldTypeHelper } from '../definitions';

const helper : FieldTypeHelper = {
    key: 'string',
    parseFromQuery: (val : string) => {
        return val;
    },
    validator: Joi.string(),
    mongoDbType: String,
    swaggerTypeString: 'string',
}

export default helper;