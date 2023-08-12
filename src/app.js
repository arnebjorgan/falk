import express from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import Joi from 'joi';
import model from './model.js';
import auth from './auth.js';
import createDatabase from './database/index.js';
import modelHandlers from './modelHandlers/index.js';
import createEndpointHandler from './endpointHandler.js';
import createDocs from './docs.js';

export default () => {
    let app = {};
    
    app.databaseFactory = undefined;
    app.authFunc = undefined;
    app.models = [];
    app.middlewares = [];
    app.customEndpoints = [];
    app.corsOptions = undefined;
    app.log = undefined;
    app.port = process.env.PORT || 8080;

    app.database = {
        memory() {
            if(app.databaseFactory != undefined) throw new Error('Database is configured twice');
            app.databaseFactory = createDatabase.memory();
        },
        mongodb(connectionString) {
            if(app.databaseFactory != undefined) throw new Error('Database is configured twice');
            Joi.assert(connectionString, Joi.string().required());
            app.databaseFactory = createDatabase.mongodb(connectionString);
        },
    };

    app.auth = (authFunc) => {
        if(app.authFunc) throw new Error('App auth function is called twice');
        Joi.assert(authFunc, Joi.function().required());
        app.authFunc = authFunc;
    };

    app.model = (name, fields) => {
        Joi.assert(name, Joi.string().required());
        Joi.assert(fields, Joi.object().required());
        if(app.models.some(model => model.name === name)) throw new Error(`Model "${name}" is registered twice`);
        const newModel = model(name, fields);
        app.models.push(newModel);
        return newModel;
    };

    app.middleware = (handler) => {
        Joi.assert(handler, Joi.function().required());
        app.middlewares.push(handler);
    };

    function createEndpoint(httpMethod) {
        return function(path, handler) {
            Joi.assert(path, Joi.string().required());
            Joi.assert(handler, Joi.function().required());
            app.customEndpoints.push({
                httpMethod,
                path,
                handler,
            });
        };
    }

    app.get = createEndpoint('get'),
    app.post = createEndpoint('post'),
    app.put = createEndpoint('put'),
    app.patch = createEndpoint('patch'),
    app.delete = createEndpoint('delete'),

    app.cors = (corsOptions) => {
        if(app.corsOptions != undefined) throw new Error('App cors function is called twice');
        Joi.assert(corsOptions, Joi.required());
        app.corsOptions = corsOptions;
    };

    app.logger = (logger) => {
        if(app.log != undefined) throw new Error('App logger function is called twice');
        Joi.assert(logger, Joi.object({
            info: Joi.function().required(),
            error: Joi.function().required(),
        }));
        app.log = logger;
    };

    app.start = async (optionalPort) => {
        Joi.assert(optionalPort, Joi.number());

        if(!app.log) {
            app.log = console;
        }

        // Default database if not configured
        if(!app.databaseFactory) {
            app.log.info(`⚠️  No database configured, using default memory database`);
            app.databaseFactory = createDatabase.memory();
        }

        // Create database
        const database = await app.databaseFactory(app.models);

        // Init/setup app
        const expressApp = express();
        expressApp.set('query parser', 'simple');
        expressApp.use(cors(app.corsOptions || false));
        expressApp.use(express.json());

        // Docs
        const swaggerJSON = createDocs(app.models.filter(model => model.isExposed), app.customEndpoints);
        expressApp.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON));
        app.log.info('🕮  Open API documentation on /docs');

        // Auth
        if(app.authFunc) {
            app.log.info('🔒 Auth check enabled');
            const authMiddleware = auth(app.authFunc, database);
            expressApp.use(authMiddleware);
        }
        else {
            app.log.info('⚠️  No auth check');
        }

        // Middleware
        app.middlewares.forEach(handler => {
            expressApp.use(createEndpointHandler(handler, database));
        });
        if(app.middlewares.length) {
            console.info(`☑ Registered ${app.middlewares.length} middlewares`);
        }

        // Models
        app.models.forEach(model => {
            if(model.isExposed) {
                app.log.info(`🌎 ${model.name} - live on API`);
                const handlers = modelHandlers(model, database, app.log);
                expressApp.get(`/${model.name}/:id`, handlers.getById);
                expressApp.get(`/${model.name}`, handlers.getMany);
                expressApp.post(`/${model.name}`, handlers.post);
                expressApp.put(`/${model.name}/:id`, handlers.put);
                expressApp.patch(`/${model.name}/:id`, handlers.patch);
                expressApp.delete(`/${model.name}/:id`, handlers.del);
            }
            else {
                app.log.info(`📦 ${model.name} - modeled in database`);
            }
        });

        // Custom endpoints
        app.customEndpoints.forEach(endpoint => {
            expressApp[endpoint.httpMethod](endpoint.path, createEndpointHandler(endpoint.handler, database));
            console.info(`☑ Custom endpoint ${endpoint.httpMethod} ${endpoint.path}`);
        });

        // Startup
        const finalPort = optionalPort != undefined ? optionalPort : app.port;
        expressApp.listen(finalPort, () => {
            app.log.info(`⚡ API listening at port ${finalPort}`);
        });

    };

    return app;
};