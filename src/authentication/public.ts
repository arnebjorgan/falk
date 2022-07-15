import express from 'express';
import { Middleware } from '../definitions';

export default (authenticationConfiguration : any) : Middleware => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) : void => {
        next();
    }
}