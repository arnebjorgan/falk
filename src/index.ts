import createDatabase from './database';
import createAuthentication from './authentication';
import server from './server';
import { ApiKeyConfiguration, App, AuthenticationConfiguration, AuthenticationType, Database, DatabaseConfiguration, DatabaseType, JwtConfiguration, Middleware, Model } from './definitions';
import validateModels from './configurationValidators/validateModels';
import validateDatabaseConfiguration from './configurationValidators/validateDatabaseConfiguration';
import validateServerConfiguration from './configurationValidators/validateServerConfiguration';
import validateAuthentication from './configurationValidators/validateAuthentication';

module.exports = () : App => {
    let databaseType = DatabaseType.MEMORY;
    let databaseConfiguration : DatabaseConfiguration;
    let authenticationType = AuthenticationType.PUBLIC;
    let authenticationConfiguration : AuthenticationConfiguration;
    const models : Model[] = [];

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
        model(model: Model) : void {
            models.push(model);
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
                models,
                port: finalPort,
            });
        }
    }
};