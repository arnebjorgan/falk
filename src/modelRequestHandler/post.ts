import { Request, Response, NextFunction } from 'express';
import { Database, Model, ModelHandler, PrepareHandleResult } from '../definitions';
import createRequestBodyValidator from './createRequestBodyValidator';

//TODO

export default (model: Model, database: Database) : ModelHandler  => {
    const bodyValidator = createRequestBodyValidator(model);
    return {
        prepareHandle: async(req: Request) => {
            const result = {
                newResource: {
                    id: req.params.id,
                    data: req.body,
                },
                oldResource: null,
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
            const bodyErrors = bodyValidator(req.body);
            if(bodyErrors) {
                result.errorStatus = 400;
                result.error = bodyErrors;
            }
            return result;
        },
        handle: async (req: Request, res: Response, next: NextFunction) => {
            const result = await database.collection(model.name).create(req.body);
            res.send(result);
        },
    };
};