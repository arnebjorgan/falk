import { Request, Response, NextFunction } from 'express';
import { Database, Model, ModelHandler, PrepareHandleResult } from '../definitions';

export default (model: Model, database: Database) : ModelHandler  => {

    const getNotFoundMessage = (id: string) => {
        return `Could not find ${model.name} with id ${id}`
    };

    return {
        prepareHandle: async(req: Request) => {
            const result = {
                id: req.params.id,
                data: undefined,
                oldData: null,
                operation: {
                    read: false,
                    get: false,
                    list: false,
                    write: true,
                    create: false,
                    update: false,
                    delete: true,
                },
            } as PrepareHandleResult;
            const oldData = await database.collection(model.name).getById(req.params.id);
            if(!oldData) {
                result.errorStatus = 404;
                result.error = getNotFoundMessage(req.params.id);
            }
            else {
                result.oldData = oldData;
            }
            return result;
        },
        handle: async (req: Request) => {
            const result = await database.collection(model.name).delete(req.params.id);
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