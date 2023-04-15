import express from 'express'
import Joi from 'joi';
import { SchemaDefinitionProperty } from 'mongoose';

export interface Model {
    name: string,
    fields: {[key: string]: Field<Type> },
    isExposed: boolean,
    authFunction?: ModelAuthFunction,
    expose(authFunction: ModelAuthFunction) : void,
}

export type Type = string|number|boolean|Date;

export interface Field<T> {
    fieldType: FieldType<T>,
    isRequired: boolean,
    customValidator?: (val: unknown) => boolean, //TODO use T
    required() : Field<T>,
    validator(validator: (val: unknown) => boolean) : Field<T>, //TODO use T
}

export interface FieldType<T> {
    typeString: string,
    parseFromQuery(val : string) : T|string,
    validator: Joi.Schema,
    mongoDbType: SchemaDefinitionProperty,
    swaggerTypeString : string,
    swaggerFormatString? : string,
    swaggerReadonly?: boolean,
    autoField?: {
        getCreateValue?: () => T,
        getUpdateValue?: () => T,
    },
}

export interface ModelHandler {
    prepareHandle(req: express.Request) : Promise<PrepareHandleResult>,
    handle(req: express.Request, res: express.Response, next: express.NextFunction, prepareResult?: PrepareHandleResult) : Promise<void>,
}

export type ModelAuthFunction = (context: ModelRequestContext, database: Database) => Promise<boolean> | boolean;

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

/*
const users = await db.collection('users').getMany([db.filter.eq('username', req.body.username), db.filter.eq('password', req.body.password)]);
const users = await db.model.users.getMany([db.model.users.username.eq(req.body.username), db.model.users.password.eq(req.body.password)]);
const users = await db.model.users.getMany({
    username: db.filter.eq(req.body.username),
    password: db.filter.eq(req.body.password)
});
db.model.cars.getMany()
*/

export interface Database {
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

//TODO clean up

export type DatabaseGetManyOptions = {
    sorters?: DatabaseSorter[],
    limit?: number,
    skip?: number,
}

//@internal
export interface Endpoint {
    method: HttpMethod,
    path: string,
    handler: RequestHandler,
}

//@internal
export type HttpMethod = 'get'|'post'|'put'|'patch'|'delete'; 

export type ModelRequestContext = {
    auth?: any,
    id?: string,
    data: any,
    oldData: any,
    operation: Operation,
    expressRequest: Express.Request,
}

export type AppAuthFunc = (req: Express.Request, database: Database, accept: (auth?: any) => void, reject: () => void) => Promise<void> | void;

export type PrepareHandleResult = {
    errorStatus?: number,
    error?: string,
    id?: string,
    data?: any,
    oldData?: any,
    operation: Operation,
    getManyFilters: DatabaseFilter[],
    getManySorters: DatabaseSorter[],
    getManyLimit?: number,
    getManySkip?: number,
}

export interface RequestHandler {
    (req: express.Request, res: express.Response, next: express.NextFunction, db: Database) : Promise<void>|void;
}