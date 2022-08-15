import Joi from 'joi';
import { FieldTypeHelper } from '../definitions';

const helper : FieldTypeHelper = {
    key: 'boolean',
    parseFromQuery: (val : string) => {
        if(val === 'true') {
            return true;
        }
        else if(val === 'false') {
            return false;
        }
        else {
            return val;
        }
    },
    validator: Joi.boolean(),
    mongoDbType: Boolean,
    swaggerTypeString: 'boolean',
}

export default helper;