import express from 'express';
import { AuthFunc } from './definitions';
import { Database } from './definitions';

export default (authFunc: AuthFunc, database: Database) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) : Promise<void> => {
        try {
            await authFunc(
                req,
                database,
                (auth?: unknown) => {
                    res.locals._falk_auth = auth;
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