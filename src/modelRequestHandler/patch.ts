import { Request, Response, NextFunction } from 'express';
import { Database, Model, ModelHandler, PrepareHandleResult } from '../definitions';
import createRequestBodyValidator from './requestBodyValidator';

export default (model: Model, database: Database) : ModelHandler  => {

    const getNotFoundMessage = (id: string) => {
        return `Could not find ${model.name} with id ${id}`;
    }

    const requestBodyValidator = createRequestBodyValidator(model, { merge: true });

    return {
        prepareHandle: async(req: Request) => {
            const result = {
                id: req.params.id,
                data: null,
                oldData: null,
                operation: {
                    read: false,
                    get: false,
                    list: false,
                    write: true,
                    create: false,
                    update: true,
                    delete: false,
                },
            } as PrepareHandleResult;
            
            const bodyErrors = requestBodyValidator(req.body);
            if(bodyErrors) {
                result.errorStatus = 400;
                result.error = bodyErrors;
            }
            else {
                const oldData = await database.collection(model.name).getById(req.params.id);
                if(!oldData) {
                    result.errorStatus = 404;
                    result.error = getNotFoundMessage(req.params.id);
                }
                else {
                    result.data = {
                        ...oldData,
                        ...req.body,
                    };
                    result.oldData = oldData;
                }
            }
            return result;
        },
        handle: async (req: Request) => {
            const result = await database.collection(model.name).update(req.params.id, req.body);
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
                    data: getNotFoundMessage(req.params.id),
                    success: false,
                };
            }
        },
    };
};