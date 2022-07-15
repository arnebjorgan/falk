import Joi from 'joi';
import { AuthenticationType } from '../definitions';
const validationSchemas = {
    public: Joi.any(),
    apiKey: Joi.object({
        key: Joi.string().required(),
        headerName: Joi.string().required(),
    }).required(),
    jwt: Joi.object({
        secret: Joi.string().required(),
        authEndpoint: Joi.string().required(),
        authCheck: Joi.function().arity(3).required(),
        tokenExpirationMS: Joi.number().integer(),
    }),
};

export default (authenticationType: AuthenticationType, authenticationConfiguration: any) : void => {
    const { error } = validationSchemas[authenticationType].validate(authenticationConfiguration, { abortEarly: false });
    if(error) {
        error.details.forEach((detail: { message: any; }) => console.error(detail.message));
        process.exit(1);
    }
};