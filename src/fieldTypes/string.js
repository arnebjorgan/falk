import Joi from 'joi';

export default {
    typeString: 'string',
    parseFromQuery: (val) => {
        return val;
    },
    validator: Joi.string(),
    mongoDbType: String,
    swaggerTypeString: 'string',
    swaggerFormatString: 'string',
};