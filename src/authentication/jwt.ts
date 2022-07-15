import express from 'express';
import jwt from 'jsonwebtoken';
import { JwtConfiguration, Middleware } from '../definitions';

export default (configuration : JwtConfiguration) : Middleware => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) : void => {
        if(req.method === 'POST' && req.path === configuration.authEndpoint) {
            next();
        }
        else {
            try {
                const authorizationHeader =  req.get('Authorization');
                if(!authorizationHeader) {
                    res.status(401).send(`Request header 'Authorization' for JWT Bearer authentication is missing`);
                }
                else if(!authorizationHeader.startsWith('Bearer ')) {
                    res.status(401).send(`Request header 'Authorization' for JWT Bearer authentication is not on the format 'Bearer {TOKEN}'`);
                }
                else {
                    const token = authorizationHeader.split('Bearer ')[1];
                    jwt.verify(token, configuration.secret);
                    next();
                }
            } catch(e) {
                res.status(401).send('Invalid JWT');
            }
        }
    }
}