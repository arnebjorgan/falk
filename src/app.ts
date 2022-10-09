import express from 'express';
import swaggerUI from 'swagger-ui-express';
import { z } from 'zod';
import createMemoryDatabase from './database/memory';
import createMongodbDatabase from './database/mongodb';
import createAuth from './auth';
import createModel from './model';
import createRequestHandler from './requestHandler';
import createModelRequestHandler from './modelRequestHandler';
import createDocs from './docs';
import { AuthFunc, DatabaseFactory, Endpoint, Field, Type, HttpMethod, Model, RequestHandler } from './definitions';

export default () => {
    let _databaseFactory : DatabaseFactory|undefined;
    let _authFunc : AuthFunc|undefined;
    const _middlewares : RequestHandler[] = [];
    const _models : Model[] = [];
    const _endpoints : Endpoint[] = [];

    const createEndpoint = (method: HttpMethod, path: string, handler: RequestHandler) => {
        z.string().parse(path);
        z.function().parse(handler);
        _endpoints.push({ method, path, handler });
    };

    return {
        database: {
            memory() {
                if(_databaseFactory) throw new Error('Database is configured more than once');
                _databaseFactory = createMemoryDatabase();
            },
            mongodb(connectionString: string) {
                if(_databaseFactory) throw new Error('Database is configured more than once');
                z.string().parse(connectionString);
                _databaseFactory = createMongodbDatabase(connectionString);
            },
        },
        auth(authFunc: AuthFunc) : void {
            if(_authFunc) throw new Error('Auth is configured more than once');
            z.function().parse(authFunc);
            _authFunc = authFunc;
        },
        middleware(middleware : express.RequestHandler) : void {
            z.function().parse(middleware);
            _middlewares.push(middleware);
        },
        model(name: string, fields: {[key: string]: Field<Type> }) {
            z.string().parse(name);
            z.object({}).passthrough().parse(fields);
            if(_models.some(model => model.name === name)) throw new Error(`Model "${name}" is configured more than once`);
            const model = createModel(name, fields);
            _models.push(model);
            return model;
        },
        get: createEndpoint.bind(this, 'get',),
        post: createEndpoint.bind(this, 'post',),
        put: createEndpoint.bind(this, 'put',),
        patch: createEndpoint.bind(this, 'patch',),
        delete: createEndpoint.bind(this, 'delete',),
        async start() : Promise<void> {

            // Default database if not configured
            if(!_databaseFactory) _databaseFactory = createMemoryDatabase();

            // Create database
            const database = await _databaseFactory(_models);

            // Init/setup app
            const app = express();
            app.use(express.json());

            // Auth
            if(_authFunc) {
                console.info(`Auth check enabled 🔒`)
                app.use(createAuth(_authFunc, database));
            }
            else {
                console.info(`No auth check, all endpoints are public ⚠️`)
            }

            // Middleware
            _middlewares.forEach(middleware => {
                app.use(createRequestHandler(middleware, database));
            });

            // Models
            _models.forEach(model => {
                if(model.isExposed) {
                    app.get(`/${model.name}/:id`, createModelRequestHandler.getById(model, database));
                    app.get(`/${model.name}`, createModelRequestHandler.getMany(model, database));
                    app.post(`/${model.name}`, createModelRequestHandler.post(model, database));
                    app.put(`/${model.name}/:id`, createModelRequestHandler.put(model, database));
                    app.patch(`/${model.name}/:id`, createModelRequestHandler.patch(model, database));
                    app.delete(`/${model.name}/:id`, createModelRequestHandler.del(model, database));
                    console.info(`🌎 ${model.name} - exposed on API`);
                }
                else {
                    console.info(`📦 ${model.name} - modeled in database`);
                }
            });


            // Manual endpoints
            _endpoints.forEach(endpoint => {
                app[endpoint.method](endpoint.path, createRequestHandler(endpoint.handler, database));
                console.info(`☑ Custom endpoint ${endpoint.method} ${endpoint.path}`);
            });

            // Docs
            app.get('/', swaggerUI.serve, swaggerUI.setup(createDocs(_models.filter(model => model.isExposed), _endpoints)));

            // Startup
            app.listen(8080, () => {
                console.info('Listening at port 8080 ⚡');
            });

        },
    }
};