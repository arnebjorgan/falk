import Joi from 'joi';
import { DatabaseFilterOperator, DatabaseGetManyOptions, Field, Model } from '../definitions';
const validatorMap = {
    string: Joi.string,
    number: Joi.number,
    boolean: Joi.boolean,
};

export default (model: Model) => {
    let validationObject : { [key: string] : any } = {};
    validationObject._skip = Joi.number().integer().positive();
    validationObject._limit = Joi.number().integer().positive();

    const fieldNames = model.fields.map((field : Field) => field.name);
    validationObject.sorters = Joi.array().items(Joi.object({
        //@ts-ignore
        fieldName: Joi.string().valid(...fieldNames).required().error(errors => {
            errors.forEach(err => {
                err.message = `_sort field ${err.value} does not exist, must be one of [${fieldNames.join(', ')}]`;
            });
            return errors;
        }),
        sortDirection: Joi.any(),
    }));
    
    let filterValueValidator = Joi.alternatives().conditional('key', { not: Joi.alternatives(...fieldNames), then: Joi.any() });
    const arrayFilter = Joi.alternatives(DatabaseFilterOperator.IN, DatabaseFilterOperator.NOTIN);
    model.fields.forEach(field => {
        const fieldTypeValidator = validatorMap[field.type]().required();
        filterValueValidator = filterValueValidator.conditional(
            'key', {
                is: field.name,
                then: Joi.when(
                    'operator', {
                        is: arrayFilter,
                        then: Joi.array().items(fieldTypeValidator),
                        otherwise: fieldTypeValidator,
                    },
                ),
            },
        );
    });
    validationObject.filters = Joi.array().items(Joi.object({
        //@ts-ignore
        key: Joi.string().valid(...fieldNames).required().error(errors => {
            errors.forEach(err => {
                err.message = `filter field ${err.value} does not exist, must be one of [${fieldNames.join(', ')}]`;
            });
            return errors;
        }),
        //@ts-ignore
        value: filterValueValidator.error(errors => {
            errors.forEach(err => {
                const filterObjectCandidate = err.state.ancestors?.[1];
                const fieldName = filterObjectCandidate.key ? filterObjectCandidate.key : filterObjectCandidate?.[0].key;
                const field = model.fields.find(field => field.name === fieldName);
                err.message = `${fieldName ? `${fieldName} ` : ''}filter ${field ? `must be a ${field.type}` : 'is the wrong type'}, was ${err.value}`;
            });
            return errors;
        }),
        operator: Joi.any(),
    }));

    const validationSchema = Joi.object(validationObject);
    return (getManyOptions: DatabaseGetManyOptions) : string | null =>  {
        const { error } = validationSchema.validate(getManyOptions, { abortEarly: false });
        return error ? error.details.map((detail: { message: any; }) => detail.message).join(', ') : null;
    };
};