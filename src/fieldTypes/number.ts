import Joi from 'joi';
import { FieldTypeHelper } from '../definitions';

const helper : FieldTypeHelper = {
    parseFromQuery: (val : string) => {
        //@ts-ignore
        return isNaN(val) ? val : parseFloat(val);
    },
    validator: Joi.number(),
    mongoDbType: Number,
    swaggerTypeString: 'number',
}

export default helper;