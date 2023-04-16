import { Database, DatabaseCollection, DatabaseFactory, Model } from '../definitions';
import memory from './memory';
import mongodb from './mongodb';

const databaseFactory = (coreFactory : DatabaseFactory) : DatabaseFactory => {
    return async (models: Model[]) : Promise<Database> => {
        const database = await coreFactory(models);
        return {
            ...database,
            collection: (modelName : string) : DatabaseCollection => {
                const coreDatabaseCollection = database.collection(modelName);
                return {
                    ...coreDatabaseCollection,
                    create: (data: any) => {
                        const model = models.find(model => model.name === modelName);
                        if(model) {
                            for (const [key, value] of Object.entries(model.fields)) {
                                if(value.fieldType.autoField?.getCreateValue) data[key] = value.fieldType.autoField?.getCreateValue?.();
                                if(value.fieldType.autoField?.getUpdateValue) data[key] = value.fieldType.autoField?.getUpdateValue?.();
                            }
                        }
                       return coreDatabaseCollection.create(data);
                    },
                    update: (id: string, data: any) => {
                        const model = models.find(model => model.name === modelName);
                        if(model) {
                            for (const [key, value] of Object.entries(model.fields)) {
                                if(value.fieldType.autoField?.getUpdateValue) data[key] = value.fieldType.autoField?.getUpdateValue?.();
                            }
                        }
                       return coreDatabaseCollection.update(id, data);
                    },
                    put: (id: string, data: any) => {
                        const model = models.find(model => model.name === modelName);
                        if(model) {
                            for (const [key, value] of Object.entries(model.fields)) {
                                if(value.fieldType.autoField?.getCreateValue) data[key] = value.fieldType.autoField?.getCreateValue?.();
                                if(value.fieldType.autoField?.getUpdateValue) data[key] = value.fieldType.autoField?.getUpdateValue?.();
                            }
                        }
                       return coreDatabaseCollection.put(id, data);
                    },
                };
            },
        }
    };
};

export default {
    memory: () : DatabaseFactory => {
        return databaseFactory(memory());
    },
    mongodb: (connectionString: string) : DatabaseFactory => {
        return databaseFactory(mongodb(connectionString));
    },
};