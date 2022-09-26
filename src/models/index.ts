import { AllowFunction, Field, Model } from '../definitions';

export default (name: string, fields: Field[]) : Model => {
    let model = {
        name,
        fields,
    } as Model;

    model.expose = (allowFunction: AllowFunction) => {
        model.isExposed = true;
        model.allow = allowFunction;
    };

    return model;
};