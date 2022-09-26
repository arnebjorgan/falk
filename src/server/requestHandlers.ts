import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Database, Model, Operation, RequestHandlerFactory } from '../definitions';
import getById from './getById';
import getMany from './getMany';
import post from './post';
import put from './put';
import patch from './patch';
import del from './del';

const requestHandler = (handler : RequestHandlerFactory, operation: Operation) : RequestHandlerFactory => {
    return (model: Model, database: Database) : RequestHandler => {
        const coreHandler = handler(model, database);
        return async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
            try {
                if(model.allow && !model.allow(req.body, operation, res.locals._falk_user, database)) {
                    res.status(403).send('Operation forbidden');
                }
                else {
                    await coreHandler(req, res, next);
                }
            } catch(e) {
                console.error(e);
                res.status(500).send('An unexpected error occured');
            }
        }
    }
};

export default {
    getById: requestHandler(getById, { read: true, get: true, list: false, write: false, create: false, update: false, delete: false, }),
    getMany: requestHandler(getMany, { read: true, get: false, list: true, write: false, create: false, update: false, delete: false, }),
    post: requestHandler(post, { read: false, get: false, list: false, write: true, create: true, update: false, delete: false, }),
    put: requestHandler(put, { read: false, get: false, list: false, write: true, create: false, update: true, delete: false, }),
    patch: requestHandler(patch, { read: false, get: false, list: false, write: true, create: false, update: true, delete: false, }),
    del: requestHandler(del, { read: false, get: false, list: false, write: true, create: false, update: false, delete: true, }),
};