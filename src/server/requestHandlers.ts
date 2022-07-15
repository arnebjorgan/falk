import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Database, Model, RequestHandlerFactory } from '../definitions';
import getById from './getById';
import getMany from './getMany';
import post from './post';
import put from './put';
import patch from './patch';
import del from './del';

const requestHandler = (handler : RequestHandlerFactory) : RequestHandlerFactory => {
    return (model: Model, database: Database) : RequestHandler => {
        const coreHandler = handler(model, database);
        return async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
            try {
                await coreHandler(req, res, next);
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