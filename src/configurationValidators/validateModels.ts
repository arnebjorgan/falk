import Joi from 'joi';
import { Model } from '../definitions';
const validationSchema = Joi.array().items(
    Joi.object({
        name: Joi.string().required(),
        fields: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            type: Joi.string().valid('string', 'number', 'boolean').required(),
            required: Joi.boolean(),
        })).min(1).required(),
        expose: Joi.boolean(),
    }).required()
).min(1);

export default (models: Model[]) : void => {
    const { error } = validationSchema.validate(models, { abortEarly: false });
    if(error) {
        error.details.forEach((detail: { message: any; }) => console.error(detail.message));
        process.exit(1);
    }
};