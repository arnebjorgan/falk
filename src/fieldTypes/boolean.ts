import { z } from 'zod';
import { FieldType } from '../definitions';

const helper : FieldType<boolean> = {
    parseFromQuery: (val : string|boolean) => {
        if(val === 'true' || val === '1') {
            return true;
        }
        else if(val === 'false' || val === '0') {
            return false;
        }
        else if(val === true) {
            return true;
        }
        else if(val === false) {
            return false;
        }
        else {
            return false;
        }
    },
    validator: z.boolean(),
    mongoDbType: Boolean,
    swaggerTypeString: 'boolean',
}

export default helper;