import express, { Request, RequestHandler } from "express"

export enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
}

export type Field = {
    name: string,
    type: FieldType,
    required?: boolean,
}

export type Model = {
    name: string,
    fields: Field[],
}

export type ApiKeyConfiguration = {
    key: string,
    headerName: string,
}

export type JwtConfiguration = {
    secret: string,
    authEndpoint: string,
    authCheck: (req: Request, accept: (userData?: { [key: string]: any }) => Promise<void>, reject: () => Promise<void>) => Promise<void>,
    tokenExpirationMS?: number,
}

export type App = {
    database: {
        memory() : void,
        mongodb(connectionString: string) : void,
    },
    authentication: {
        public() : void,
        apiKey(configuration: ApiKeyConfiguration) : void,
        jwt(configuration: JwtConfiguration) : void,
    },
    model(model: Model) : void,
    startServer(port?: number) : Promise<void>,
}

//@internal
export type Middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => void;

//@internal
export enum AuthenticationType {
    PUBLIC = 'public',
    API_KEY = 'apiKey',
    JWT = 'jwt',
}

//@internal
export type DatabaseConfiguration = undefined | string;

//@internal
export type AuthenticationConfiguration = undefined | ApiKeyConfiguration | JwtConfiguration;

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
export type Database = {
    tryGetById(modelName: string, id: string) : any,
    getMany(modelName: string, options: DatabaseGetManyOptions) : any,
    create(modelName: string, data: any) : any,
    tryUpdate(modelName: string, id: string, data: any) : any,
    update(modelName: string, id: string, data: any) : any,
    tryDelete(modelName: string, id: string) : any,
}