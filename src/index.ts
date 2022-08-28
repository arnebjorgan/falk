import express from 'express';
import createDatabase from './database';
import createAuthentication from './authentication';
import server from './server';
import { createFieldHelper } from './fieldTypes';
import { ApiKeyConfiguration, App, AuthenticationConfiguration, AuthenticationType, Database, DatabaseConfiguration, DatabaseType, Field, FieldConfiguration, FieldType, JwtConfiguration, ManualEndpoint, Middleware, Model, ModelConfiguration } from './definitions';
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
    const beforeAlls : express.RequestHandler[] = [];
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
        },
        beforeAll(beforeAll : express.RequestHandler) : void {
            beforeAlls.push(beforeAll)
        },
        model(name: string, fields: {[key: string]: { type: FieldType, configuration: FieldConfiguration } }, configuration?: ModelConfiguration) : void {
            const fieldArray : Field[] = [];
            for(const [key, value] of Object.entries(fields)) {
                fieldArray.push({
                    name: key,
                    type: value.type,
                    ...value.configuration,
                });
            }
            models.push({
                name,
                fields: fieldArray,
                ...configuration, 
            });
        },
        endpoint:{
            get: (path: string, requestHandler : express.RequestHandler) => endpoints.push({ method: 'get', path, requestHandler }),
            post: (path: string, requestHandler : express.RequestHandler) => endpoints.push({ method: 'post', path, requestHandler }),
            put: (path: string, requestHandler : express.RequestHandler) => endpoints.push({ method: 'put', path, requestHandler }),
            patch: (path: string, requestHandler : express.RequestHandler) => endpoints.push({ method: 'patch', path, requestHandler }),
            delete: (path: string, requestHandler : express.RequestHandler) => endpoints.push({ method: 'delete', path, requestHandler }),
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
                beforeAlls,
                models,
                endpoints,
                port: finalPort,
            });
        },
    }
};