import express from 'express'
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
    isExposed?: boolean,
    allow?: AllowFunction,
    expose: (allowFunction: AllowFunction) => void
};

export type AllowFunction = (request: ModelRequest, resource: Resource|null, operation: Operation, database: Database) => Promise<boolean> | boolean;

export type Operation = {
    read: boolean,
    get: boolean,
    list: boolean,
    write: boolean,
    create: boolean,
    update: boolean,
    delete: boolean,
}

export type Database = {
    collection(modelName: string) : DatabaseCollection,
    filter: {
        eq(fieldName: string, value: any) : DatabaseFilter,
        neq(fieldName: string, value: any) : DatabaseFilter,
        like(fieldName: string, value: any) : DatabaseFilter,
        gt(fieldName: string, value: any) : DatabaseFilter,
        gte(fieldName: string, value: any) : DatabaseFilter,
        lt(fieldName: string, value: any) : DatabaseFilter,
        lte(fieldName: string, value: any) : DatabaseFilter,
        in(fieldName: string, value: any) : DatabaseFilter,
        nin(fieldName: string, value: any) : DatabaseFilter,
        createFilter(fieldName: string, operator: DatabaseFilterOperator, value: any) : DatabaseFilter,
    },
    sort(fieldName: string, direction?: DatabaseSortDirection) : DatabaseSorter,
}

export type DatabaseCollection = {
    getById(id: string) : any,
    getMany(filters?: DatabaseFilter[], options?: DatabaseGetManyOptions) : any,
    create(data: any) : any,
    update(id: string, data: any) : any,
    put(id: string, data: any) : any,
    delete(id: string) : any,
}

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

export enum DatabaseSortDirection {
    ASC = 'asc',
    DESC = 'desc', 
}

export type DatabaseSorter = {
    fieldName: string,
    direction: DatabaseSortDirection,
}

export type DatabaseFilter = {
    key: string,
    value: any,
    operator: DatabaseFilterOperator,
}

export type GetManyQueryOptions = {
    filters: DatabaseFilter[],
    sorters: DatabaseSorter[],
    _limit?: number,
    _skip?: number,
}

export type DatabaseGetManyOptions = {
    sorters?: DatabaseSorter[],
    limit?: number,
    skip?: number,
}

export type ApiKeyConfiguration = {
    key: string,
    headerName: string,
}

export type JwtConfiguration = {
    secret: string,
    authEndpoint: string,
    authCheck: (data: { [key:string]: any }, acceptUser: (userData?: { [key: string]: any }) => Promise<void>, rejectUser: () => Promise<void>) => Promise<void>,
    tokenExpirationMS?: number,
}

export type Resource = {
    id?: string,
    data?: any,
}

export type ModelRequest = {
    auth?: any,
    resource: Resource,
    baseRequest: express.Request,
}

export type UserProviderFunc = (req: Express.Request, acceptUser: (userData?: any) => void, rejectUser: () => void) => Promise<void> | void;

export type ManualEndpointHandler = (req: express.Request, res: express.Response, next: express.NextFunction, db: Database) => Promise<void> | void;

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
    middleware(requestHandler : express.RequestHandler) : void,
    model(name: string, fields: {[key: string]: { type: FieldType, configuration: FieldConfiguration } }) : Model,
    endpoint: {
        get(path : string, requestHandler : ManualEndpointHandler) : void,
        post(path : string, requestHandler : ManualEndpointHandler) : void,
        put(path : string, requestHandler : ManualEndpointHandler) : void,
        patch(path : string, requestHandler : ManualEndpointHandler) : void,
        delete(path : string, requestHandler : ManualEndpointHandler) : void,
    },
    startServer(port?: number) : Promise<void>,
}

//@internal
export type PrepareHandleResult = {
    errorStatus?: number,
    error?: string,
    newResource: Resource,
    oldResource: Resource|null,
    operation: Operation,
    getManyFilters: DatabaseFilter[],
    getManySorters: DatabaseSorter[],
    getManyLimit?: number,
    getManySkip?: number,
}

//@internal
export type ModelHandler = {
    prepareHandle(req: express.Request) : Promise<PrepareHandleResult>,
    handle: (req: express.Request, res: express.Response, next: express.NextFunction, prepareHandleResult?: PrepareHandleResult) => void,
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
export type RequestHandlerFactory = (model: Model, database: Database) => express.RequestHandler;

//@internal
export type ModelHandlerFactory = (model: Model, database: Database) => ModelHandler;

//@internal
export type ManualEndpoint = {
    method: ManualEndpointHttpMethod,
    path: string,
    requestHandler: ManualEndpointHandler,
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
    autoField?: {
        getCreateValue?: () => any,
        getUpdateValue?: () => any,
    },
}