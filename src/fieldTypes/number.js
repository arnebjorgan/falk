import Joi from 'joi';

export default {
    typeString: 'number',
    parseFromQuery: (val) => {
        return parseFloat(val);
    },
    validator: Joi.number(),
    mongoDbType: Number,
    swaggerTypeString: 'number',
    swaggerFormatString: 'number',
};