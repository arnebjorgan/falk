import Joi from 'joi';

export default {
    typeString: 'boolean',
    parseFromQuery: (val) => {
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
    swaggerFormatString: 'boolean',
};