import { Request, Response, NextFunction } from 'express';
import { Database, Model, ModelHandler, PrepareHandleResult } from '../definitions';
import createRequestBodyValidator from './createRequestBodyValidator';

export default (model: Model, database: Database) : ModelHandler  => {
    const bodyValidator = createRequestBodyValidator(model, { merge: true });

    const getNotFoundMessage = (id: string) => {
        return `Could not find ${model.name} with id ${id}`;
    }

    return {
        prepareHandle: async(req: Request) => {
            const result = {
                newResource: {
                    id: req.params.id,
                    data: null,
                },
                oldResource: null,
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
            
            const bodyErrors = bodyValidator(req.body);
            if(bodyErrors) {
                result.errorStatus = 400;
                result.error = bodyErrors;
            }
            else {
                const oldResource = await database.collection(model.name).getById(req.params.id);
                if(!oldResource) {
                    result.errorStatus = 404;
                    result.error = getNotFoundMessage(req.params.id);
                }
                else {
                    result.newResource = {
                        ...oldResource,
                        ...req.body,
                    };
                    result.oldResource = oldResource;
                }
            }
            return result;
        },
        handle: async (req: Request, res: Response, next: NextFunction) => {
            const result = await database.collection(model.name).update(req.params.id, req.body);
            if(result) {
                res.send(result);
            }
            else {
                res.status(404).send(getNotFoundMessage(req.params.id));
            }
        },
    };
};