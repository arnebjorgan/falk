import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Database, Model, ModelHandler } from '../definitions';
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
                if(model.allowFunction) {
                    prepareResult = await modelHandler.prepareHandle(req);
                    if(prepareResult.error) {
                        res.status(prepareResult.errorStatus ? prepareResult.errorStatus : 500).send(prepareResult.error);
                        return;
                    }
                    const operationIsAllowed = await model.allowFunction({
                        auth: res.locals._falk_auth,
                        resource: prepareResult.newResource,
                        baseRequest: req,
                    }, prepareResult.oldResource, prepareResult.operation, database);
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