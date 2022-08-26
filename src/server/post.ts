import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Database, Model } from '../definitions';
import createRequestBodyValidator from './createRequestBodyValidator';

export default (model: Model, database: Database) : RequestHandler  => {
    const bodyValidator = createRequestBodyValidator(model);
    return async (req: Request, res: Response, next: NextFunction) => {
        model.fields.forEach(field => {
            if(field.type === 'auto_created_at' || field.type === 'auto_updated_at') {
                req.body[field.name] = new Date();
            }
        });
        const bodyErrors = bodyValidator(req.body);
        if(bodyErrors) {
            res.status(400).send(bodyErrors);
        }
        else {
            const result = await database.create(model.name, req.body);
            res.send(result);
        }
    };
};