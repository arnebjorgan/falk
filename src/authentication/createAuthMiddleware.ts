import express from 'express';
import { AuthFunc, Middleware } from '../definitions';

export default (authFunc : AuthFunc) : Middleware => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) : Promise<void> => {
        try {
            await authFunc(
                req,
                (userData?: unknown) => {
                    res.locals._falk_auth = userData;
                    next();
                },
                () => {
                    res.status(401).send('User is not authorized');
                },
            );
        } catch(e) {
            res.status(401).send('User is not authorized');
        }
    }
}