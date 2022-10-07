import Joi from 'joi';
import { AuthFunc } from '../definitions';

export default (authFunc: AuthFunc) : void => {
    const { error } = Joi.function().required().validate(authFunc, { abortEarly: false });
    if(error) {
        error.details.forEach((detail: { message: any; }) => console.error(detail.message));
        process.exit(1);
    }
};