import string from './string';
import number from './number';
import boolean from './boolean';
//import datetime from './datetime';

const fieldTypes = {
    string,
    number,
    boolean,
    //datetime,
};

export default fieldTypes;

export const typeKeys =  Object.keys(fieldTypes);

export const helperObject = typeKeys.reduce((acc : { [key:string] : unknown }, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
}, {});