import { z } from 'zod';
import { Field, FieldType } from './definitions';
import string from './fieldTypes/string';
import number from './fieldTypes/number';
import boolean from './fieldTypes/boolean';
import datetime from './fieldTypes/datetime';
import autoCreatedAt from './fieldTypes/autoCreatedAt';
import autoUpdatedAt from './fieldTypes/autoUpdatedAt';

const createField = <T>(fieldType: FieldType<T>) => {
    return () : Field<T> => {
        return {
            fieldType: fieldType,
            isRequired: false,
            required() {
                this.isRequired = true;
                return this;
            },
            validator(validator: (val: T) => boolean) {
                z.function().parse(validator);
                this.customValidator = validator;
                return this;
            },
        };
    };
}

export default {
    string: createField<string>(string),
    number: createField<number>(number),
    boolean: createField<boolean>(boolean),
    datetime: createField<Date>(datetime),
    auto: {
        createdAt: createField<Date>(autoCreatedAt),
        updatedAt: createField<Date>(autoUpdatedAt),
    },
}