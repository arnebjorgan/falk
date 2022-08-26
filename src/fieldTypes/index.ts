import string from './string';
import number from './number';
import boolean from './boolean';
import datetime from './datetime';
import auto_created_at from './auto_created_at';
import auto_updated_at from './auto_updated_at';

const fieldTypes = {
    string,
    number,
    boolean,
    datetime,
    auto_created_at,
    auto_updated_at,
};

//Remember to add new type option to type Field in src/definitions.ts

export default fieldTypes;

export const typeKeys =  Object.keys(fieldTypes);

export const helperObject = typeKeys.reduce((acc : { [key:string] : unknown }, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
}, {});