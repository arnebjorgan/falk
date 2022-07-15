import Joi from 'joi';
import { DatabaseType } from '../definitions';
const validationSchemas = {
    memory: Joi.any(),
    mongodb: Joi.string().required(),
};

export default (databaseType: DatabaseType, databaseConfiguration: any) : void => {
    const { error } = validationSchemas[databaseType].validate(databaseConfiguration, { abortEarly: false });
    if(error) {
        error.details.forEach((detail: { message: any; }) => console.error(detail.message));
        process.exit(1);
    }
};