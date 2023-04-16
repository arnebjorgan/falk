import { Request, Response, NextFunction } from 'express';
import { Database, Model, ModelHandler, PrepareHandleResult } from '../definitions';
import createRequestBodyValidator from './requestBodyValidator';

export default (model: Model, database: Database) : ModelHandler  => {
    const requestBodyValidator = createRequestBodyValidator(model);
    return {
        prepareHandle: async(req: Request) => {
            const result = {
                id: req.params.id,
                data: req.body,
                oldData: null,
                operation: {
                    read: false,
                    get: false,
                    list: false,
                    write: true,
                    create: true,
                    update: false,
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
            const result = await database.collection(model.name).create(req.body);
            return {
                status: 200,
                data: result,
                success: true,
            };
        },
    };
};