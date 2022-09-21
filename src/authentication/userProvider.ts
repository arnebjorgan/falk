import express from 'express';
import { UserProviderFunc, Middleware } from '../definitions';

export default (userProviderFunc : UserProviderFunc) : Middleware => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) : Promise<void> => {
        try {
            await userProviderFunc(
                req,
                (userData?: unknown) => {
                    res.locals._falk_user = userData;
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