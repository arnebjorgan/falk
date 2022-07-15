import express from 'express';
import { ApiKeyConfiguration, Middleware } from '../definitions';

export default (configuration : ApiKeyConfiguration) : Middleware => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) : void => {
        const header = req.get(configuration.headerName);
        if(!header) {
            res.status(401).send(`Request header '${configuration.headerName}' for API key authentication is missing`);
        }
        else if(header !== configuration.key) {
            res.status(401).send(`Request header '${configuration.headerName}' has wrong API key`);
        }
        else {
            next();
        }
    }
}