import Joi from 'joi';

export default {
    typeString: 'datetime',
    parseFromQuery: (val) => {
        const parsed = new Date(val);
        try {
            return parsed.toISOString() === val ? parsed : val;
        } catch(e) {
            return val;
        }
    },
    validator: Joi.date().iso(),
    mongoDbType: Date,
    swaggerTypeString: 'string',
    swaggerFormatString: 'date-time',
};