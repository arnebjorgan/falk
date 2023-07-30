import Joi from 'joi';

export default (name, fields) => {
    let model = {};
    
    model.name = name;
    model.fields = fields;
    model.isExposed = false;
    model.authFunc = undefined;
    model.onCreateFunc = undefined;
    model.onUpdateFunc = undefined;
    model.onDeleteFunc = undefined;

    model.expose = (authFunc) => {
        if(model.authFunc) throw new Error(`Model ${model.name}'s expose function is called twice`);
        Joi.assert(authFunc, Joi.function().required());
        model.isExposed = true;
        model.authFunc = authFunc;
        return model;
    };

    model.onCreate = (onCreateFunc) => {
        if(model.onCreateFunc) throw new Error(`Model ${model.name}'s onCreate function is called twice`);
        Joi.assert(onCreateFunc, Joi.function().required());
        model.onCreateFunc = onCreateFunc;
        return model;
    };

    model.onUpdate = (onUpdateFunc) => {
        if(model.onUpdateFunc) throw new Error(`Model ${model.name}'s onUpdate function is called twice`);
        Joi.assert(onUpdateFunc, Joi.function().required());
        model.onUpdateFunc = onUpdateFunc;
        return model;
    };

    model.onDelete = (onDeleteFunc) => {
        if(model.onDeleteFunc) throw new Error(`Model ${model.name}'s onDelete function is called twice`);
        Joi.assert(onDeleteFunc, Joi.function().required());
        model.onDeleteFunc = onDeleteFunc;
        return model;
    };
    
    return model;
};