import Joi from 'joi';
import { FieldTypeHelper } from '../definitions';

const helper : FieldTypeHelper = {
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
        getUpdateValue() { return new Date() },
    },
}

export default helper;