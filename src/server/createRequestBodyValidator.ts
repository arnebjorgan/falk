import Joi from 'joi';
import fieldTypes from '../fieldTypes';
import { Field, Model } from '../definitions';

export default (model: Model, options = { merge: false }) => {
    let validationObject : { [key: string] : any } = {};
    model.fields.forEach((field: Field) => {
        let fieldValidator = fieldTypes[field.type].validator;
        if(field.required && !options.merge) {
            fieldValidator = fieldValidator.required();
        }
        if(field.validator) {
            const customValidator = (val: unknown, helper: any) => {
                const customValidationResult = field.validator?.(val);
                if(customValidationResult === true) {
                    return val;
                }
                else {
                    //This error is not returned when used in Joi.alternatives(). Should be possible to have custom errors, also provided by end developer.
                    throw new Error(`Invalid value for field ${field.name}`);
                }
            }
            fieldValidator = Joi.alternatives().try(fieldValidator, Joi.custom(customValidator)).match('all');
        }
        validationObject[field.name] = fieldValidator;
    });
    const validationSchema = Joi.object(validationObject);
    return (requestBody: Object) : string | null =>  {
        const { error } = validationSchema.validate(requestBody, { abortEarly: false });
        return error ? error.details.map((detail: { message: any; }) => detail.message).join(', ') : null;
    };
};