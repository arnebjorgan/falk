import express from 'express';
import swaggerUI from 'swagger-ui-express';
import { Model, Database, Middleware, ManualEndpoint } from '../definitions';
import requestHandlers from './requestHandlers';
import createManualEndpoint from './createManualEndpoint';
import generateDocs from './generateDocs';

export default async (configuration: {
    database: Database,
    authMiddleware?: Middleware,
    middlewares: express.RequestHandler[],
    models: Model[],
    endpoints: ManualEndpoint[],
    port: number,
}) : Promise<void> => {

    // Init
    const app = express();
    app.use(express.json());

    // Auth
    if(configuration.authMiddleware) {
        console.info(`Auth enabled 🔒`)
        app.use(configuration.authMiddleware);
    }
    else {
        console.info(`No auth, all endpoints are public ⚠️`)
    }

    //Middlware
    configuration.middlewares.forEach(middleware => {
        app.use(middleware);
    });

    // Models
    configuration.models.forEach(model => {
        if(model.isExposed) {
            app.get(`/${model.name}/:id`, requestHandlers.getById(model, configuration.database));
            app.get(`/${model.name}`, requestHandlers.getMany(model, configuration.database));
            app.post(`/${model.name}`, requestHandlers.post(model, configuration.database));
            app.put(`/${model.name}/:id`, requestHandlers.put(model, configuration.database));
            app.patch(`/${model.name}/:id`, requestHandlers.patch(model, configuration.database));
            app.delete(`/${model.name}/:id`, requestHandlers.del(model, configuration.database));
            console.info(`🌎 ${model.name} - exposed on API`);
        }
        else {
            console.info(`📦 ${model.name} - modeled in database`);
        }
    });

    // Manual endpoints
    configuration.endpoints.forEach(endpoint => {
        app[endpoint.method](endpoint.path, createManualEndpoint(endpoint.requestHandler, configuration.database));
        console.info(`☑ ${endpoint.method} ${endpoint.path} - manual endpoint registered`);
    });

    // Docs
    app.get('/', swaggerUI.serve, swaggerUI.setup(generateDocs(configuration.models, configuration.endpoints)));

    // Startup
    app.listen(configuration.port, () => {
        console.info(`Listening at port ${configuration.port} ⚡`);
    });
};