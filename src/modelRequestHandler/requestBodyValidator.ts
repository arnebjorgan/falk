import { z } from 'zod';
import { Model } from '../definitions';

export default (model: Model, options = { merge: false }) => {
    
    let fieldObjectSchema : { [key:string]: Zod.ZodTypeAny } = {};
    for(const [key, value] of Object.entries(model.fields)) {
        if(!value.fieldType.autoField) {
            let validator = value.fieldType.validator;
            if(!value.isRequired || options.merge) {
                validator = validator.optional();
            }
            if(value.customValidator) {
                validator = validator.refine(value.customValidator, (val) => ({
                    message: `Invalid value for field ${key}`,
                }));
            }
            fieldObjectSchema[key] = validator;
        }
    }
    const modelSchema = z.object(fieldObjectSchema);

    return (requestBody: Object) : string | null =>  {
        const result = modelSchema.safeParse(requestBody);
        return result.success ? null : result.error.issues.join(', ');
    };
};