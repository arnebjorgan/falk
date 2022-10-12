import Joi from 'joi';
import { DatabaseFilterOperator, GetManyQueryOptions, Model } from '../definitions';

export default (model: Model) => {
    let validationObject : { [key: string] : any } = {};
    validationObject._skip = Joi.number().integer().positive();
    validationObject._limit = Joi.number().integer().positive();

    const fieldNames = Object.keys(model.fields);
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
    Object.entries(model.fields).forEach(([fieldName ,field]) => {
        const fieldTypeValidator = field.fieldType.validator.required();
        filterValueValidator = filterValueValidator.conditional(
            'key', {
                is: fieldName,
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
                const fieldEntry = Object.entries(model.fields).find(([key, field]) => key === fieldName);
                err.message = `${fieldName ? `${fieldName} ` : ''}filter ${fieldEntry ? `must be a ${fieldEntry[1].fieldType.typeString}` : 'is the wrong type'}, was ${err.value}`;
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