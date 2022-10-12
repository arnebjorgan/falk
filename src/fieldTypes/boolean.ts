import Joi from 'joi';
import { FieldType } from '../definitions';

const helper : FieldType<boolean> = {
    typeString: 'boolean',
    parseFromQuery: (val : string) => {
        if(val === 'true' || val === '1') {
            return true;
        }
        else if(val === 'false' || val === '0') {
            return false;
        }
        else return val;
    },
    validator: Joi.boolean(),
    mongoDbType: Boolean,
    swaggerTypeString: 'boolean',
}

export default helper;