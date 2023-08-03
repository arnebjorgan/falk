import Joi from 'joi';

export default {
    typeString: 'number',
    parseFromQuery: (val) => {
        const parsed = parseFloat(val);
        return parsed.toString() === val ? parsed : val;
    },
    validator: Joi.number(),
    mongoDbType: Number,
    swaggerTypeString: 'number',
    swaggerFormatString: 'number',
};