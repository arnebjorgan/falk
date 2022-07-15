import Joi from 'joi';
const validationSchema = Joi.number().port().required();

export default (port: number = 8080) : number => {
    const { error } = validationSchema.validate(port, { abortEarly: false });
    if(error) {
        error.details.forEach((detail: { message: any; }) => console.error(detail.message));
        process.exit(1);
    }
    else {
        return port;
    }
};