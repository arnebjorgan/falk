import Joi from 'joi';

export default (model) => {
    let createValidationObj = {};
    let mergeValidationObj = {};
    Object.entries(model.fields).forEach(([fieldName, field]) => {
        createValidationObj[fieldName] = field.isRequired ? field.type.validator.required() : field.type.validator;
        mergeValidationObj[fieldName] = field.type.validator;
        /*
        if(field.customValidator) {
            const customValidator = (val: unknown, helper: any) => {
                const customValidationResult = field.customValidator?.(val);
                if(customValidationResult === true) {
                    return val;
                }
                else {
                    //This error is not returned when used in Joi.alternatives(). Should be possible to have custom errors, also provided by end developer.
                    throw new Error(`Invalid value for field ${fieldName}`);
                }
            }
            fieldValidator = Joi.alternatives().try(fieldValidator, Joi.custom(customValidator)).match('all');
        }
        */
    });
    const createValidationSchema = Joi.object(createValidationObj);
    const mergeValidationSchema = Joi.object(mergeValidationObj);
    return (requestBody, options = { merge: false }) =>  {
        const schema = options.merge ? mergeValidationSchema : createValidationSchema;
        const { error } = schema.validate(requestBody, { abortEarly: false });
        return error ? error.details.map((detail) => detail.message).join(', ') : null;
    };
};