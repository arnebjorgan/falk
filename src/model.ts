import { ModelAuthFunction, Field, Type, Model } from './definitions';

export default (name: string, fields: {[key: string]: Field<Type> }) : Model => {
    return {
        name,
        fields,
        isExposed: false,
        expose(authFunction: ModelAuthFunction) {
            this.isExposed = true;
            this.authFunction = authFunction;
        },
    };
}