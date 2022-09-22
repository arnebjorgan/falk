import string from './string';
import number from './number';
import boolean from './boolean';
import datetime from './datetime';
import auto_created_at from './auto_created_at';
import auto_updated_at from './auto_updated_at';
import { FieldConfiguration, FieldType } from '../definitions';

//Remember to add new type option to type FieldType in src/definitions.ts

const createField = (type: FieldType, configuration : FieldConfiguration = {}) : { type: FieldType, configuration: FieldConfiguration } => {
    return {
        type,
        configuration,
    };
};

export const createFieldHelper = {
    string: createField.bind(this, 'string'),
    number: createField.bind(this, 'number'),
    boolean: createField.bind(this, 'boolean'),
    datetime: createField.bind(this, 'datetime'),
    auto: {
        createdAt: createField.bind(this, 'auto_created_at'),
        updatedAt: createField.bind(this, 'auto_updated_at'),
    },
};

const fieldTypes = {
    string,
    number,
    boolean,
    datetime,
    auto_created_at,
    auto_updated_at,
};

export default fieldTypes;