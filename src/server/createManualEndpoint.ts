import express from 'express';
import { Database, ManualEndpointHandler } from "../definitions";

export default (handler: ManualEndpointHandler, database: Database) : express.RequestHandler => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) : Promise<void> => {
        await handler(req, res, next, database);
    }
}