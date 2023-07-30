import mongoose from 'mongoose';

export default (connectionString) => async(models) => {
    await mongoose.connect(connectionString);
    let dbModels = models.reduce((acc, model) => {
        let mongooseSchemaObj = {};
        for (const [key, value] of Object.entries(model.fields)) {
            mongooseSchemaObj[key] = value.type.mongoDbType;
        }
        const mongooseSchema = new mongoose.Schema(mongooseSchemaObj, { versionKey: false });
        const mongooseModel = mongoose.model(model.name, mongooseSchema);
        acc[model.name] = mongooseModel;
        return acc;
    }, {});

    return {
        filter: {
            eq(val) { return { $eq: val }},
            ne(val) { return { $ne: val }},
            like(val) { return { $regex: `.*${val}.*` }},
            gt(val) { return { $gt: val }},
            gte(val) { return { $gte: val }},
            lt(val) { return { $lt: val }},
            lte(val) { return { $lte: val }},
            in(val) { return { $in: val }},
            nin(val) { return { $nin: val }},
        },
        sortAsc(fieldName) {
            return { fieldName, direction: 1 };
        },
        sortDesc(fieldName) {
            return { fieldName, direction: -1 };
        },
        model(modelName) {
            return {
                async create(data) {
                    return await dbModels[modelName].create(data);
                },
                async getById(id) {
                    const isValidId = mongoose.isValidObjectId(id);
                    if(!isValidId) {
                        return null;
                    }
                    return await dbModels[modelName].findById(id);
                },
                async update(id, data) {
                    const isValidId = mongoose.isValidObjectId(id);
                    if(!isValidId) {
                        return null;
                    }
                    return await dbModels[modelName].findByIdAndUpdate(id, data, { new: true });
                },
                async put(id, data) {
                    const isValidId = mongoose.isValidObjectId(id);
                    if(!isValidId) {
                        return null;
                    }
                    return await dbModels[modelName].findByIdAndUpdate(id, { ...data, _id: id }, { new: true, upsert: true, overwrite: true });
                },
                async delete(id) {
                    const isValidId = mongoose.isValidObjectId(id);
                    if(!isValidId) {
                        return null;
                    }
                    return await dbModels[modelName].findByIdAndDelete(id);
                },
                async getMany(filterObj, options) {
                    let query = dbModels[modelName].find(filterObj);
                    if(options?.sort) {
                        const finalSorterInput = Array.isArray(options.sort) ? options.sort : [options.sort];
                        const mongooseSorter = finalSorterInput.reduce((acc, current) => {
                            acc[current.fieldName] = current.direction;
                            return acc;
                        }, {});
                        query = query.sort(mongooseSorter);
                    }
                    if(options?.limit != null && options?.limit != undefined) query = query.limit(options.limit);
                    if(options?.skip != null && options?.skip != undefined) query = query.skip(options.skip);
                    return query;
                },
            };
        },
    };
};