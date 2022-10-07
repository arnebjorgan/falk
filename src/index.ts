import express from 'express';
import createDatabase from './database';
import createAuthMiddleware from './authentication/createAuthMiddleware';
import server from './server';
import createModel from './models';
import { createFieldHelper } from './fieldTypes';
import { App, AuthFunc, Database, DatabaseConfiguration, DatabaseType, Field, FieldConfiguration, FieldType, ManualEndpoint, ManualEndpointHandler, Middleware, Model } from './definitions';
import validateModels from './configurationValidators/validateModels';
import validateDatabaseConfiguration from './configurationValidators/validateDatabaseConfiguration';
import validateServerConfiguration from './configurationValidators/validateServerConfiguration';
import validateAuthentication from './authentication/validateAuthentication';

export const fieldType = createFieldHelper;

export default () : App => {
    let databaseType = DatabaseType.MEMORY;
    let databaseConfiguration : DatabaseConfiguration;
    let authMiddleware : Middleware|undefined;
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
        auth(authFunc: AuthFunc) : void {
            validateAuthentication(authFunc)
            authMiddleware = createAuthMiddleware(authFunc);
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
        get: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'get', path, requestHandler }),
        post: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'post', path, requestHandler }),
        put: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'put', path, requestHandler }),
        patch: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'patch', path, requestHandler }),
        delete: (path: string, requestHandler : ManualEndpointHandler) => endpoints.push({ method: 'delete', path, requestHandler }),
        async startServer(port?: number) : Promise<void> {
            validateDatabaseConfiguration(databaseType, databaseConfiguration);
            validateModels(models);
            const finalPort : number = validateServerConfiguration(port);

            const database : Database = await createDatabase(databaseType, databaseConfiguration, models);
            server({
                database,
                authMiddleware,
                middlewares,
                models,
                endpoints,
                port: finalPort,
            });
        },
    }
};