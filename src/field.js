import fieldTypes from './fieldTypes/index.js';

const createField = (type) => () => {
    let field = {};

    field.type = type;
    field.isRequired = false;

    field.required = () => {
        field.isRequired = true;
        return field;
    };

    return field;
};

export default fieldTypes.reduce((acc, current) => {
    acc[current.typeString] = createField(current);
    return acc;
}, {});