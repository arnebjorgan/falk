import { Request, Response, NextFunction } from 'express';
import { Database, Model, ModelHandler, PrepareHandleResult } from '../definitions';
import createRequestBodyValidator from './requestBodyValidator';

export default (model: Model, database: Database) : ModelHandler  => {
    const requestBodyValidator = createRequestBodyValidator(model);
    return {
        prepareHandle: async(req: Request) => {
            const oldData = await database.collection(model.name).getById(req.params.id);
            const result = {
                id: req.params.id,
                data: req.body,
                oldData: oldData,
                operation: {
                    read: false,
                    get: false,
                    list: false,
                    write: true,
                    create: !oldData,
                    update: !!oldData,
                    delete: false,
                },
            } as PrepareHandleResult;
            const bodyErrors = requestBodyValidator(req.body);
            if(bodyErrors) {
                result.errorStatus = 400;
                result.error = bodyErrors;
            }
            return result;
        },
        handle: async (req: Request) => {
            const result = await database.collection(model.name).put(req.params.id, req.body);
            if(result) {
                return {
                    status: 200,
                    data: result,
                    success: true,
                };
            }
            else {
                return {
                    status: 404,
                    data: `Could not find ${model.name} with id ${req.params.id}`,
                    success: false,
                };
            }
        },
    };
};