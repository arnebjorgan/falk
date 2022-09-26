import Joi from 'joi';
import { Model } from '../definitions';
import fieldTypes from '../fieldTypes';

const validationSchema = Joi.array().items(
    Joi.object({
        name: Joi.string().required(),
        fields: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            type: Joi.string().valid(...Object.keys(fieldTypes)).required(),
            required: Joi.boolean(),
            validator: Joi.function().arity(1),
        })).min(1).required(),
        isExposed: Joi.boolean(),
        expose: Joi.function(),
        allow: Joi.function(),
    }).required()
).min(1);

export default (models: Model[]) : void => {
    const { error } = validationSchema.validate(models, { abortEarly: false });
    if(error) {
        error.details.forEach((detail: { message: any; }) => console.error(detail.message));
        process.exit(1);
    }
};