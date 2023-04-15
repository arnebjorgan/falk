import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Database, Model, ModelHandler, ModelRequestContext } from '../definitions';
import getById from './getById';
import getMany from './getMany';
import post from './post';
import put from './put';
import patch from './patch';
import del from './del';

const requestHandler = (handler : (model: Model, database: Database) => ModelHandler) => {
    return (model: Model, database: Database) : RequestHandler => {
        const modelHandler = handler(model, database);
        return async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
            try {
                let prepareResult;
                if(model.authFunction) {
                    prepareResult = await modelHandler.prepareHandle(req);
                    if(prepareResult.error) {
                        res.status(prepareResult.errorStatus ? prepareResult.errorStatus : 500).send(prepareResult.error);
                        return;
                    }
                    const context : ModelRequestContext = {
                        auth: res.locals._falk_auth,
                        id: prepareResult.id,
                        data: prepareResult.data,
                        oldData: prepareResult.oldData,
                        operation: prepareResult.operation,
                        expressRequest: req,
                    };
                    const operationIsAllowed = await model.authFunction(context, database);
                    if(!operationIsAllowed) {
                        res.status(403).send('Operation forbidden');
                        return;
                    }
                }
                await modelHandler.handle(req, res, next, prepareResult);
            } catch(e) {
                console.error(e);
                res.status(500).send('An unexpected error occured');
            }
        }
    }
};

export default {
    getById: requestHandler(getById),
    getMany: requestHandler(getMany),
    post: requestHandler(post),
    put: requestHandler(put),
    patch: requestHandler(patch),
    del: requestHandler(del),
};