import mongoose, { SchemaDefinitionProperty } from 'mongoose';
import { Database, DatabaseFilter, DatabaseFilterOperator, DatabaseSortDirection, DatabaseGetManyOptions, DatabaseSorter, Model, DatabaseFactory } from '../definitions';

export default (connectionString: string) : DatabaseFactory => {
    return async(modelInput: Model[]) : Promise<Database> => {
        await mongoose.connect(connectionString);
        let models : { [key: string]: { userModel: Model, dbModel: mongoose.Model<any> }} = {};
        modelInput.forEach((model: Model) => {
            let schemaObject : { [key:string]: SchemaDefinitionProperty } = {};
            for (const [key, value] of Object.entries(model.fields)) {
                schemaObject[key] = value.fieldType.mongoDbType;
            }
            const schema = new mongoose.Schema(schemaObject, { versionKey: false });
            models[model.name] = {
                userModel: model,
                dbModel: mongoose.model(model.name, schema),
            };
        });

        return {
            filter: {
                eq(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.EQUAL }},
                neq(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.NOTEQUAL }},
                like(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.LIKE }},
                gt(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.GREATER }},
                gte(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.GREATEROREQUAL }},
                lt(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.LESS }},
                lte(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.LESSOREQUAL }},
                in(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.IN }},
                nin(fieldName: string, value: any) { return { key: fieldName, value, operator: DatabaseFilterOperator.NOTIN }},
                createFilter(fieldName: string, operator: DatabaseFilterOperator, value: any) { return { key: fieldName, value, operator }},
            },
            sort(fieldName: string, direction: DatabaseSortDirection = DatabaseSortDirection.ASC) { return { fieldName, direction }},
            collection(modelName: string) {
                return {
                    getById(id: string) {
                        const isValidId = mongoose.isValidObjectId(id);
                        if(!isValidId) {
                            return null;
                        }
                        return models[modelName].dbModel.findById(id);
                    },
                    getMany(filters: DatabaseFilter[] = [], options?: DatabaseGetManyOptions) {
                        const mongodbFilter = filters.reduce((acc: any, current: DatabaseFilter) => {
                            if(current.operator === DatabaseFilterOperator.EQUAL) {
                                acc[current.key] = current.value;
                                return acc;
                            }
                            else if(current.operator === DatabaseFilterOperator.LIKE) {
                                acc[current.key] = { $regex: `.*${current.value}.*` };
                            }
                            else if(current.operator === DatabaseFilterOperator.NOTEQUAL) {
                                acc[current.key] = { $ne: current.value };
                            }
                            else if(current.operator === DatabaseFilterOperator.GREATER) {
                                acc[current.key] = { $gt: current.value };
                            }
                            else if(current.operator === DatabaseFilterOperator.GREATEROREQUAL) {
                                acc[current.key] = { $gte: current.value };
                            }
                            else if(current.operator === DatabaseFilterOperator.LESS) {
                                acc[current.key] = { $lt: current.value };
                            }
                            else if(current.operator === DatabaseFilterOperator.LESSOREQUAL) {
                                acc[current.key] = { $lte: current.value };
                            }
                            else if(current.operator === DatabaseFilterOperator.IN) {
                                acc[current.key] = { $in: current.value };
                            }
                            else if(current.operator === DatabaseFilterOperator.NOTIN) {
                                acc[current.key] = { $nin: current.value };
                            }
                            return acc;
                        }, {});
                        let query = models[modelName].dbModel.find(mongodbFilter);
                        if(options?.sorters?.length) {
                            const mongodbSorter = options.sorters.reduce((acc: any, current: DatabaseSorter) => {
                                acc[current.fieldName] = current.direction;
                                return acc;
                            }, {});
                            query = query.sort(mongodbSorter);
                        }
                        if(options?.limit) query = query.limit(options.limit);
                        if(options?.skip) query = query.skip(options.skip);
                        return query;
                    },
                    create(data: any) {
                        for (const [key, value] of Object.entries(models[modelName].userModel.fields)) {
                            if(value.fieldType.autoField?.getCreateValue) data[key] = value.fieldType.autoField?.getCreateValue?.();
                            if(value.fieldType.autoField?.getUpdateValue) data[key] = value.fieldType.autoField?.getUpdateValue?.();
                        }
                        return models[modelName].dbModel.create(data);
                    },
                    update(id: string, data: any) {
                        const isValidId = mongoose.isValidObjectId(id);
                        if(!isValidId) {
                            return null;
                        }
                        for (const [key, value] of Object.entries(models[modelName].userModel.fields)) {
                            if(value.fieldType.autoField?.getUpdateValue) data[key] = value.fieldType.autoField?.getUpdateValue?.();
                        };
                        return models[modelName].dbModel.findByIdAndUpdate(id, data, { new: true });
                    },
                    put(id: string, data: any) {
                        const isValidId = mongoose.isValidObjectId(id);
                        if(!isValidId) {
                            return null;
                        }
                        for (const [key, value] of Object.entries(models[modelName].userModel.fields)) {
                            if(value.fieldType.autoField?.getCreateValue) data[key] = value.fieldType.autoField?.getCreateValue?.();
                            if(value.fieldType.autoField?.getUpdateValue) data[key] = value.fieldType.autoField?.getUpdateValue?.();
                        }
                        return models[modelName].dbModel.findByIdAndUpdate(id, { ...data, _id: id }, { new: true, upsert: true, overwrite: true });
                    },
                    delete(id: string) {
                        const isValidId = mongoose.isValidObjectId(id);
                        if(!isValidId) {
                            return null;
                        }
                        return models[modelName].dbModel.findByIdAndDelete(id);
                    },
                }
            },
        };
    }
};