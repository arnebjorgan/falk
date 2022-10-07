import express from 'express';
import createDatabase from './database';
import createAuthentication from './authentication';
import server from './server';
import createModel from './models';
import { createFieldHelper } from './fieldTypes';
import { ApiKeyConfiguration, App, AuthenticationConfiguration, AuthenticationType, Database, DatabaseConfiguration, DatabaseType, Field, FieldConfiguration, FieldType, JwtConfiguration, ManualEndpoint, ManualEndpointHandler, Middleware, Model, UserProviderFunc } from './definitions';
import validateModels from './configurationValidators/validateModels';
import validateDatabaseConfiguration from './configurationValidators/validateDatabaseConfiguration';
import validateServerConfiguration from './configurationValidators/validateServerConfiguration';
import validateAuthentication from './configurationValidators/validateAuthentication';

export const fieldType = createFieldHelper;

export default () : App => {
    let databaseType = DatabaseType.MEMORY;
    let databaseConfiguration : DatabaseConfiguration;
    let authenticationType = AuthenticationType.PUBLIC;
    let authenticationConfiguration : AuthenticationConfiguration;
    const middlewares : express.RequestHandler[] = [];
    const models : Model[] = [];
    const endpoints : ManualEndpoint[] = [];

    return {
        database: {
            memory() : void {
                databaseType = DatabaseType.MEMORY;
            },
            mongodb(connectionString: string) : void {
                databaseType = DatabaseType.MONGODB;
                databaseConfiguration = connectionString;
            },
        },
        authentication: {
            public() : void {
                authenticationType = AuthenticationType.PUBLIC;
            },
            apiKey(configuration : ApiKeyConfiguration) : void {
                authenticationType = AuthenticationType.API_KEY;
                authenticationConfiguration = configuration;
            },
            jwt(configuration: JwtConfiguration) : void {
                authenticationType = AuthenticationType.JWT;
                authenticationConfiguration = configuration;
            },
            userProvider(userProviderFunc: UserProviderFunc) : void {
                authenticationType = AuthenticationType.USER_PROVIDER;
                authenticationConfiguration = userProviderFunc;
            },
        },
        middleware(middleware : express.RequestHandler) : void {
            middlewares.push(middleware)
        },
        model(name: string, fields: {[key: string]: { type: FieldType, configuration: FieldConfiguration } }) : Model {
            const fieldArray : Field[] = [];
            for(const [key, value] of Object.entries(fields)) {
                fieldArray.push({
                    name: key,
                    type: value.type,
                    ...value.configuration,
                });
            }
            let model = createModel(name, fieldArray);
            models.push(model);
            return model;
        },
        endpoint:{
            get: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'get', path, requestHandler }),
            post: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'post', path, requestHandler }),
            put: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'put', path, requestHandler }),
            patch: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'patch', path, requestHandler }),
            delete: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'delete', path, requestHandler }),
        },
        async startServer(port?: number) : Promise<void> {
            validateDatabaseConfiguration(databaseType, databaseConfiguration);
            validateAuthentication(authenticationType, authenticationConfiguration)
            validateModels(models);
            const finalPort : number = validateServerConfiguration(port);

            const authenticationMiddleware : Middleware = createAuthentication(authenticationType, authenticationConfiguration);
            const database : Database = await createDatabase(databaseType, databaseConfiguration, models);
            server({
                database,
                authentication: {
                    type: authenticationType,
                    middleware: authenticationMiddleware,
                    configuration: authenticationConfiguration,
                },
                middlewares,
                models,
                endpoints,
                port: finalPort,
            });
        },
    }
};