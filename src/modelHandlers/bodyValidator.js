import Joi from 'joi';

export default (model, options = { merge: false }) => {
    let validationObject = {};
    Object.entries(model.fields).forEach(([fieldName, field]) => {
        let fieldValidator = field.type.validator;
        if(field.isRequired && !options.merge) {
            fieldValidator = fieldValidator.required();
        }
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
        validationObject[fieldName] = fieldValidator;
    });
    const validationSchema = Joi.object(validationObject);
    return (requestBody) =>  {
        const { error } = validationSchema.validate(requestBody, { abortEarly: false });
        return error ? error.details.map((detail) => detail.message).join(', ') : null;
    };
};