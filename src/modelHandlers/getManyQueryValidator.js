import Joi from 'joi';
import validFieldOperators from './validFieldOperators.js';

export default (model) => {
    const fieldNames = Object.keys(model.fields);

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
            operator: Joi.string().valid(...validFieldOperators).required().error(errors => {
                errors.forEach(err => {
                    err.message = `filter operator ${err.value} does not exist, must be one of [${validFieldOperators.join(', ')}]`;
                });
                return errors;
            }),
            value: Joi.alternatives().conditional('operator', {
                is: Joi.alternatives('in', 'nin'),
                then: Joi.array().items('TODO-field validator'),
                otherwise: 'TODO-field validator',
            }).error(errors => {
                errors.forEach(err => {
                    /*
                    const filterObjectCandidate = err.state.ancestors?.[1];
                    const fieldName = filterObjectCandidate.key ? filterObjectCandidate.key : filterObjectCandidate?.[0].key;
                    const fieldEntry = Object.entries(model.fields).find(([key, field]) => key === fieldName);
                    err.message = `${fieldName ? `${fieldName} ` : ''}filter ${fieldEntry ? `must be a ${fieldEntry[1].fieldType.typeString}` : 'is the wrong type'}, was ${err.value}`;
                    TODO error message
                    */
                });
                return errors;
            }),
        })),
    };
    
    const validationSchema = Joi.object(validationObject);
    
    return (getManyOptions) =>  {
        const { error } = validationSchema.validate(getManyOptions, { abortEarly: false });
        return error ? error.details.map(detail => detail.message).join(', ') : null;
    };
};