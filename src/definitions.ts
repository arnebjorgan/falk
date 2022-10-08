import express from 'express'
import Joi from 'joi';

export interface Field {
    name: string,
    type: 'string'|'number'|'boolean'|'datetime'|'auto_created_at'|'auto_updated_at',
    required?: boolean,
    validator?: (val: unknown) => boolean,
};

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

export interface DatabaseFactory { (models: Model[]) : Promise<Database> }

export interface Database {
    collection(modelName: Model) : DatabaseCollection,
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

//TODO clean up

export type DatabaseGetManyOptions = {
    sorters?: DatabaseSorter[],
    limit?: number,
    skip?: number,
}

export type Resource = {
    id?: string,
    data?: any,
}

//@internal
export interface Endpoint {
    method: HttpMethod,
    path: string,
    handler: RequestHandler,
}

//@internal
export type HttpMethod = 'get'|'post'|'put'|'patch'|'delete'; 

export type ModelRequest = {
    auth?: any,
    resource: Resource,
    baseRequest: express.Request,
}

export type AuthFunc = (req: Express.Request, database: Database, accept: (auth?: any) => void, reject: () => void) => Promise<void> | void;

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
export interface RequestHandler {
    (req: express.Request, res: express.Response, next: express.NextFunction, db: Database) : Promise<void>|void;
}

//@internal
export type RequestHandlerFactory = (model: Model, database: Database) => express.RequestHandler;

//@internal
export type FieldType = {
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