import Joi from 'joi';
import { FieldType } from '../definitions';
//TODO
const helper : FieldType = {
    parseFromQuery: (val : string) => {
        //@ts-ignore
        return isNaN(val) ? val : parseFloat(val);
    },
    validator: Joi.number(),
    mongoDbType: Number,
    swaggerTypeString: 'number',
}

export default helper;