import { AuthenticationType, Middleware } from '../definitions';
import publicAuth from './public';
import apiKey from './apiKey';
import jwt from './jwt';
const authentications = {
    public: publicAuth,
    apiKey,
    jwt,
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