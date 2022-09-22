import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Database, Model } from '../definitions';
import createRequestBodyValidator from './createRequestBodyValidator';

export default (model: Model, database: Database) : RequestHandler  => {
    const bodyValidator = createRequestBodyValidator(model);
    return async (req: Request, res: Response, next: NextFunction) => {
        const bodyErrors = bodyValidator(req.body);
        if(bodyErrors) {
            res.status(400).send(bodyErrors);
        }
        else {
            const result = await database.collection(model.name).create(req.body);
            res.send(result);
        }
    };
};