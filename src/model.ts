import { AllowFunction, Field, Type, Model } from './definitions';

export default (name: string, fields: {[key: string]: Field<Type> }) : Model => {
    return {
        name,
        fields,
        isExposed: false,
        expose(allowFunction: AllowFunction) {
            this.isExposed = true;
            this.allowFunction = allowFunction;
        },
    };
}