import Joi from 'joi';
import fieldTypes from '../field';
import { DatabaseFilterOperator, Field, GetManyQueryOptions, Model } from '../definitions';

//TODO

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
        direction: Joi.any(),
    }));
    
    let filterValueValidator = Joi.alternatives().conditional('key', { not: Joi.alternatives(...fieldNames), then: Joi.any() });
    const arrayFilter = Joi.alternatives(DatabaseFilterOperator.IN, DatabaseFilterOperator.NOTIN);
    model.fields.forEach(field => {
        const fieldTypeValidator = fieldTypes[field.type].validator.required();
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
    return (options: GetManyQueryOptions) : string | null =>  {
        const { error } = validationSchema.validate(options, { abortEarly: false });
        return error ? error.details.map((detail: { message: any; }) => detail.message).join(', ') : null;
    };
};