import express from 'express';
import cors from 'cors';
import Joi from 'joi';
import model from './model.js';
import auth from './auth.js';
import createDatabase from './database/index.js';
import modelHandlers from './modelHandlers/index.js';

export default () => {
    let app = {};
    
    app.databaseFactory = undefined;
    app.authFunc = undefined;
    app.models = [];
    app.corsOptions = false;
    app.port = process.env.PORT || 8080;

    app.database = {
        memory() {
            if(app.databaseFactory) throw new Error('Database is configured twice');
            app.databaseFactory = createDatabase.memory();
        },
        mongodb(connectionString) {
            if(app.databaseFactory) throw new Error('Database is configured twice');
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

    app.cors = (corsOptions) => {
        if(app.corsOptions) throw new Error('App cors function is called twice');
        Joi.assert(corsOptions, Joi.required());
        app.corsOptions = corsOptions;
    };

    app.start = async (optionalPort) => {
        Joi.assert(optionalPort, Joi.number());

        // Default database if not configured
        if(!app.databaseFactory) {
            console.info(`🔒 !!!TODO ANOTHER ICON!!! No database configured, using default memory database`);
            app.databaseFactory = createDatabase.memory();
        }

        // Create database
        const database = await app.databaseFactory(app.models);

        // Init/setup app
        const expressApp = express();
        expressApp.use(cors(app.corsOptions));
        expressApp.use(express.json());

        // Auth
        if(app.authFunc) {
            console.info('🔒 Auth check enabled');
            const authMiddleware = auth(app.authFunc, database);
            expressApp.use(authMiddleware);
        }
        else {
            console.info('⚠️  No auth check');
        }

        // Models
        app.models.forEach(model => {
            if(model.isExposed) {
                console.info(`🌎 ${model.name} - modeled and exposed on API`);
                const handlers = modelHandlers(model, database);
                expressApp.get(`/${model.name}/:id`, handlers.getById);
                expressApp.get(`/${model.name}`, handlers.getMany);
                expressApp.post(`/${model.name}`, handlers.post);
                expressApp.put(`/${model.name}/:id`, handlers.put);
                expressApp.patch(`/${model.name}/:id`, handlers.patch);
                expressApp.delete(`/${model.name}/:id`, handlers.del);
            }
            else {
                console.info(`📦 ${model.name} - modeled in database for internal use`);
            }
        });

        // Startup
        const finalPort = optionalPort != undefined ? optionalPort : app.port;
        expressApp.listen(finalPort, () => {
            console.info(`⚡ Listening at port ${finalPort}`);
        });

    };

    return app;
};