import Joi from 'joi';
import { Model } from '../definitions';

export default (model: Model, options = { merge: false }) => {
    let validationObject : { [key: string] : any } = {};
    Object.entries(model.fields).filter(([fieldName, field]) => !field.fieldType.autoField).forEach(([fieldName, field]) => {
        let fieldValidator = field.fieldType.validator;
        if(field.isRequired && !options.merge) {
            fieldValidator = fieldValidator.required();
        }
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
        validationObject[fieldName] = fieldValidator;
    });
    const validationSchema = Joi.object(validationObject);
    return (requestBody: Object) : string | null =>  {
        const { error } = validationSchema.validate(requestBody, { abortEarly: false });
        return error ? error.details.map((detail: { message: any; }) => detail.message).join(', ') : null;
    };
};