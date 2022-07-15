import Datastore from 'nedb';
import { Database, DatabaseFilter, DatabaseFilterOperator, DatabaseGetManyOptions, DatabaseSortDirection, DatabaseSorter, Model } from '../definitions';
const db : { [key: string]: Datastore } = {};

export default async (databaseConfiguration: any, models: Model[]) : Promise<Database> => {
    models.forEach((model: Model) => {
        db[model.name] = new Datastore();
    });
    return {
        tryGetById(modelName: string, id: string) {
            return new Promise((resolve, reject) => {
                db[modelName].findOne({ _id: id }, (err, doc) => {
                    if(err) reject(err);
                    else resolve(doc);
                });
            });
        },
        getMany(modelName: string, options: DatabaseGetManyOptions) {
            const filters = options.filters.reduce((acc: any, current: DatabaseFilter) => {
                if(current.operator === DatabaseFilterOperator.EQUAL) {
                    acc[current.key] = current.value;
                }
                else if(current.operator === DatabaseFilterOperator.NOTEQUAL) {
                    acc[current.key] = { $ne: current.value };
                }
                else if(current.operator === DatabaseFilterOperator.LIKE) {
                    acc[current.key] = { $regex: new RegExp(current.value) };
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
            return new Promise((resolve, reject) => {
                let query = db[modelName].find(filters);
                if(options.sorters.length) {
                    const dbSorters = options.sorters.reduce((acc: any, current: DatabaseSorter) => {
                        acc[current.fieldName] = current.sortDirection === DatabaseSortDirection.ASC ? 1 : -1;
                        return acc;
                    }, {});
                    query = query.sort(dbSorters);
                }
                if(options._limit) query = query.limit(options._limit);
                if(options._skip) query = query.skip(options._skip);
                query.exec((err: any, docs: unknown) => {
                    if(err) reject(err);
                    else resolve(docs);
                });
            })
        },
        create(modelName: string, data: any) {
            return new Promise((resolve, reject) => {
                db[modelName].insert(data, (err, newDoc) => {
                    if(err) reject(err);
                    else resolve(newDoc);
                });
            });
        },
        tryUpdate(modelName: string, id: string, data: any) {
            return new Promise((resolve, reject) => {
                db[modelName].findOne({ _id: id }, (err, doc) => {
                    if(err) reject(err);
                    else if(!doc) resolve(null);
                    else {
                        const mergedDocumentData = { ...doc, ...data };
                        db[modelName].update({ _id: id }, mergedDocumentData, {}, (err) => {
                            if(err) reject(err);
                            else resolve({ ...mergedDocumentData, _id: id });
                        });
                    }
                });
            });
        },
        update(modelName: string, id: string, data: any) {
            return new Promise((resolve, reject) => {
                const newDocumentData = { ...data, _id: id };
                db[modelName].update({ _id: id }, newDocumentData, { upsert: true }, (err) => {
                    if(err) reject(err);
                    else resolve(newDocumentData);
                });
            });
        },
        tryDelete(modelName: string, id: string) {
            return new Promise((resolve, reject) => {
                db[modelName].findOne({_id: id}, (err, docToDelete) => {
                    if(err) reject(err);
                    else if(!docToDelete) resolve(null);
                    else {
                        db[modelName].remove({ _id: id }, {}, (err, numRemoved) => {
                            if(err) reject(err);
                            else if(numRemoved === 0) resolve(null);
                            else resolve(docToDelete);
                        });
                    }
                });
            });
        },
    };
};