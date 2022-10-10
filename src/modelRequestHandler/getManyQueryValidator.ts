import { z } from 'zod';
import { DatabaseFilterOperator, DatabaseSortDirection, Field, GetManyQueryOptions, Model } from '../definitions';

export default (model: Model) => {

    let validationObject : { [key: string] : Zod.ZodTypeAny } = {};
    const fieldNames = Object.keys(model.fields);
    
    //Skip
    validationObject._skip = z.optional(z.number().int().positive());
    
    //Limit
    validationObject._limit = z.optional(z.number().int().positive());

    //Sorters
    validationObject.sorters = z.array(z.object({
        fieldName: z.string().refine(
            val => fieldNames.includes(val),
            val => ({ message: `_sort field ${val} does not exist, must be one of [${fieldNames.join(', ')}]` })
        ),
        direction: z.nativeEnum(DatabaseSortDirection),
    }));

    //Filters
    const validFilters = Object.entries(model.fields).map(([key, value]) => {
        return z.object({
            key: z.literal(key),
            value: value.fieldType.validator.optional(),
            operator: z.nativeEnum(DatabaseFilterOperator),
        });
    });

    //validationObject.filters = z.union(validFilters);
    //TODO
    /*
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
    */

    const validationSchema = z.object(validationObject);
    return (options: GetManyQueryOptions) : string | null =>  {
        const result = validationSchema.safeParse(options);
        return result.success ? null : result.error.issues.map(issue => issue.message).join(', ');
    };
};