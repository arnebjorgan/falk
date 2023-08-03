import Joi from 'joi';
import validFieldOperators from './validFieldOperators.js';

export default (model) => {
    const fieldNames = Object.keys(model.fields);

    let filterValueValidator = Joi.alternatives().conditional('fieldName', { not: Joi.alternatives(...fieldNames), then: Joi.any() });
    const arrayFilter = Joi.alternatives('in', 'nin');
    Object.entries(model.fields).forEach(([fieldName ,field]) => {
        const fieldTypeValidator = field.type.validator.required();
        filterValueValidator = filterValueValidator.conditional(
            'fieldName', {
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

    let validationObject = {
        skip: Joi.number().integer().positive().error(errors => {
            errors.forEach(err => {
                err.message = `_skip must be a positive integer, is ${err.value}`;
            });
            return errors;
        }),
        limit: Joi.number().integer().positive().error(errors => {
            errors.forEach(err => {
                err.message = `_limit must be a positive integer, is ${err.value}`;
            });
            return errors;
        }),
        sort: Joi.array().items(Joi.object({
            fieldName: Joi.string().valid(...fieldNames).required().error(errors => {
                errors.forEach(err => {
                    err.message = `_sort field ${err.value} does not exist, must be one of [${fieldNames.join(', ')}]`;
                });
                return errors;
            }),
            direction: Joi.string().valid('asc','desc').required().error(errors => {
                errors.forEach(err => {
                    err.message = `_sort direction ${err.value} does not exist, must be asc or desc`;
                });
                return errors;
            }),
        })),
        filters: Joi.array().items(Joi.object({
            fieldName: Joi.string().valid(...fieldNames).required().error(errors => {
                errors.forEach(err => {
                    err.message = `filter field ${err.value} does not exist, must be one of [${fieldNames.join(', ')}]`;
                });
                return errors;
            }),
            value: filterValueValidator.error(errors => {
                errors.forEach(err => {
                    const filterObjectCandidate = err.state.ancestors?.[1];
                    const fieldName = filterObjectCandidate.fieldName || filterObjectCandidate?.[0].fieldName;
                    const fieldEntry = Object.entries(model.fields).find(([key, field]) => key === fieldName);
                    err.message = `${fieldName ? `${fieldName} ` : ''}filter ${fieldEntry ? `must be a ${fieldEntry[1].type.typeString}` : 'is the wrong type'}, was ${err.value}`;
                });
                return errors;
            }),
            operator: Joi.alternatives(validFieldOperators),
        })),
    };
    
    const validationSchema = Joi.object(validationObject);
    
    return (getManyOptions) =>  {
        const { error } = validationSchema.validate(getManyOptions, { abortEarly: false });
        return error ? error.details.map(detail => detail.message).join(', ') : null;
    };
};