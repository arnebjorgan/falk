import Joi from 'joi';
import { Field, Model } from '../definitions';
const validatorMap = {
    string: Joi.string,
    number: Joi.number,
    boolean: Joi.boolean,
};

export default (model: Model, options = { merge: false }) => {
    let validationObject : { [key: string] : any } = {};
    model.fields.forEach((field: Field) => {
        let fieldValidator = validatorMap[field.type]();
        if(field.required && !options.merge) {
            fieldValidator = fieldValidator.required();
        }
        validationObject[field.name] = fieldValidator;
    });
    const validationSchema = Joi.object(validationObject);
    return (requestBody: Object) : string | null =>  {
        const { error } = validationSchema.validate(requestBody, { abortEarly: false });
        return error ? error.details.map((detail: { message: any; }) => detail.message).join(', ') : null;
    };
};