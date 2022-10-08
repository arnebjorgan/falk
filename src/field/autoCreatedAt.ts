import Joi from 'joi';
import { FieldType } from '../definitions';

//TODO

const helper : FieldType = {
    parseFromQuery: (val : string) => {
        return new Date(val);
    },
    validator: Joi.date().iso(),
    mongoDbType: Date,
    swaggerTypeString: 'string',
    swaggerFormatString: 'date-time',
    swaggerReadonly: true,
    autoField: {
        getCreateValue() { return new Date() },
    },
}

export default helper;