import { ModelAuthFunction, Field, Type, Model, ModelTriggerFunction } from './definitions';

export default (name: string, fields: {[key: string]: Field<Type> }) : Model => {
    return {
        name,
        fields,
        isExposed: false,
        expose(authFunction: ModelAuthFunction) {
            this.isExposed = true;
            this.authFunction = authFunction;
            return this;
        },
        onCreate(triggerFunction: ModelTriggerFunction) {
            this.onCreateFunction = triggerFunction;
            return this;
        },
        onUpdate(triggerFunction: ModelTriggerFunction) {
            this.onUpdateFunction = triggerFunction;
            return this;
        },
        onDelete(triggerFunction: ModelTriggerFunction) {
            this.onDeleteFunction = triggerFunction;
            return this;
        },
    };
}