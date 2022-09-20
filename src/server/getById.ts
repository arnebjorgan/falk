import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Database, Model } from '../definitions';

export default (model: Model, database: Database) : RequestHandler  => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await database.getById(model.name, req.params.id);
        if(result) {
            res.send(result);
        }
        else {
            res.status(404).send(`Could not find ${model.name} with id ${req.params.id}`);
        }
    };
};