import express, { application, RequestHandler } from 'express'
import Joi from 'joi';

export type Field = {
    name: string,
    type: FieldType,
} & FieldConfiguration;

export type FieldConfiguration = {
    required?: boolean,
    validator?: (val: unknown) => boolean,
}

export type Model = {
    name: string,
    fields: Field[],
} & ModelConfiguration;

export type ModelConfiguration = {
    expose?: boolean,
    allow?: (data: { [key:string]:unknown }, operation : Operation, user?: { [key: string]: any }) => boolean,
}

export type Operation = {
    read: boolean,
    get: boolean,
    list: boolean,
    write: boolean,
    create: boolean,
    update: boolean,
    delete: boolean,
}

export type ApiKeyConfiguration = {
    key: string,
    headerName: string,
}

export type JwtConfiguration = {
    secret: string,
    authEndpoint: string,
    authCheck: (data: { [key:string]:unknown }, acceptUser: (userData?: { [key: string]: any }) => Promise<void>, rejectUser: () => Promise<void>) => Promise<void>,
    tokenExpirationMS?: number,
}

export type UserProviderFunc = (req: Express.Request, acceptUser: (userData?: { [key: string]: any }) => void, rejectUser: () => void) => Promise<void>;

export type App = {
    database: {
        memory() : void,
        mongodb(connectionString: string) : void,
    },
    authentication: {
        public() : void,
        apiKey(configuration: ApiKeyConfiguration) : void,
        jwt(configuration: JwtConfiguration) : void,
        userProvider(providerFunc: UserProviderFunc) : void,
    },
    beforeAll(requestHandler : RequestHandler) : void,
    model(name: string, fields: {[key: string]: { type: FieldType, configuration: FieldConfiguration } }, configuration?: ModelConfiguration) : void,
    endpoint: {
        get(path : string, requestHandler : RequestHandler) : void,
        post(path : string, requestHandler : RequestHandler) : void,
        put(path : string, requestHandler : RequestHandler) : void,
        patch(path : string, requestHandler : RequestHandler) : void,
        delete(path : string, requestHandler : RequestHandler) : void,
    },
    startServer(port?: number) : Promise<void>,
}

//@internal
export type FieldType = 'string'|'number'|'boolean'|'datetime'|'auto_created_at'|'auto_updated_at';

//@internal
export type Middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => void;

//@internal
export enum AuthenticationType {
    PUBLIC = 'public',
    API_KEY = 'apiKey',
    JWT = 'jwt',
    USER_PROVIDER = 'userProvider',
}

//@internal
export type DatabaseConfiguration = undefined | string;

//@internal
export type AuthenticationConfiguration = undefined | ApiKeyConfiguration | JwtConfiguration | UserProviderFunc;

//@internal
export enum DatabaseType {
    MEMORY = 'memory',
    MONGODB = 'mongodb',
}

//@internal
export enum DatabaseFilterOperator {
    EQUAL = 'eq',
    NOTEQUAL = 'ne',
    LIKE = 'like',
    GREATER = 'gt',
    GREATEROREQUAL = 'gte',
    LESS = 'lt',
    LESSOREQUAL = 'lte',
    IN = 'in',
    NOTIN = 'nin',
}

//@internal
export enum DatabaseSortDirection {
    ASC = 'asc',
    DESC = 'desc', 
}

//@internal
export type DatabaseSorter = {
    fieldName: string,
    sortDirection: DatabaseSortDirection,
}

//@internal
export type DatabaseFilter = {
    key: string,
    value: any,
    operator: DatabaseFilterOperator,
}

//@internal
export type RequestHandlerFactory = (model: Model, database: Database) => RequestHandler;

//@internal
export type DatabaseGetManyOptions = {
    filters: DatabaseFilter[],
    sorters: DatabaseSorter[],
    _limit?: number,
    _skip?: number,
}

//@internal
export type ManualEndpoint = {
    method: ManualEndpointHttpMethod,
    path: string,
    requestHandler: express.RequestHandler,
}

//@internal
export type ManualEndpointHttpMethod = 'get'|'post'|'put'|'patch'|'delete';

//@internal
export type FieldTypeHelper = {
    parseFromQuery(val : unknown) : unknown,
    validator: Joi.Schema,
    mongoDbType: unknown,
    swaggerTypeString : string,
    swaggerFormatString? : string,
    swaggerReadonly?: boolean,
}

//@internal
export type Database = {
    tryGetById(modelName: string, id: string) : any,
    getMany(modelName: string, options: DatabaseGetManyOptions) : any,
    create(modelName: string, data: any) : any,
    tryUpdate(modelName: string, id: string, data: any) : any,
    update(modelName: string, id: string, data: any) : any,
    tryDelete(modelName: string, id: string) : any,
}