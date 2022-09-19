import { AuthenticationType, Middleware } from '../definitions';
import publicAuth from './public';
import apiKey from './apiKey';
import jwt from './jwt';
import userProvider from './userProvider';
const authentications = {
    public: publicAuth,
    apiKey,
    jwt,
    userProvider,
};

export default (authenticationType: AuthenticationType, authenticationConfiguration : any) : Middleware => {
    if(!authentications[authenticationType]) {
        console.error(`Authentication type ${authenticationType} is not supported`);
        process.exit(1)
    }
    else {
        return authentications[authenticationType](authenticationConfiguration);
    }
};