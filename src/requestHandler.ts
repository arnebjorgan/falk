import express from 'express';
import { Database, RequestHandler } from './definitions';

export default (handler: RequestHandler, database: Database) => {
    return async(req: express.Request, res: express.Response, next: express.NextFunction) => {
        await handler(req, res, next, database);
    };
};