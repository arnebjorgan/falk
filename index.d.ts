export declare const createApp: () => App;

export declare const field: {
    string: () => Field<'string'>,
    number: () => Field<'number'>,
    boolean: () => Field<'boolean'>,
    datetime: () => Field<'datetime'>,
};

interface TypeMap {
    string: string;
    number: number;
    boolean: boolean;
    datetime: Date,
}

type App = {
    cors: (corsOptions: any) => void,
    database: {
        memory: () => void,
        mongodb: (connectionString: string) => void,
    },
    auth: (appAuthFunc: (accept: (auth: any) => void, reject: () => void) => Promise<void>, expressReq: Express.Request, db: Database) => Promise<void>,
    model<T extends Record<keyof T, { type: { typeString: keyof TypeMap } }>>(modelName: string, data: T) : Model<{ [K in keyof T]: TypeMap[T[K]['type']['typeString']] }>,
    start: (optionalPort: number|undefined) => Promise<void>,
};

type Model<T> = {
    expose: (modelAuthFunc: (context: ModelRequestContext<T>, db: Database) => Promise<boolean>) => Model<T>,
    onCreate: (modelTriggerFunc: (context: ModelRequestContext<T>, db: Database) => Promise<void>) => Model<T>,
    onUpdate: (modelTriggerFunc: (context: ModelRequestContext<T>, db: Database) => Promise<void>) => Model<T>,
    onDelete: (modelTriggerFunc: (context: ModelRequestContext<T>, db: Database) => Promise<void>) => Model<T>,
};

type ModelRequestContext<T> = {
    auth: any,
    id: any,
    data: T,
    oldData: T | undefined,
    operation: {
        read: boolean,
        get: boolean,
        list: boolean,
        write: boolean,
        create: boolean,
        update: boolean,
        delete: boolean,
    },
    expressRequest: Express.Request,
    expressResponse: Express.Response,
};

type Field<T> = {
    type: {
        typeString: T,
    },
    required: () => Field<T>,
};

type Database = {
    model: (modelName: string) => {
        create: (data: any) => Promise<Record<string, any> | null>,
        getById: (id: any) => Promise<Record<string, any> | null>,
        update: (id: any, data: any) => Promise<Record<string, any> | null>,
        put: (id: any, data: any) => Promise<Record<string, any> | null>,
        delete: (id: any) => Promise<Record<string, any> | null>,
        getMany: (
            filters: Record<string, any> | null | undefined,
            options: {
                sort: string | Array<string> | null | undefined,
                limit: number | null | undefined,
                skip: number | null | undefined,
            } | null | undefined,
        ) => Promise<Array<Record<string, any>>>,
    },
    sortAsc: (fieldName: string) => any,
    sortDesc: (fieldName: string) => any,
    filter: {
        eq: (val: any) => any,
        ne: (val: any) => any,
        like: (val: any) => any,
        gt: (val: any) => any,
        gte: (val: any) => any,
        lt: (val: any) => any,
        lte: (val: any) => any,
        in: (val: any) => any,
        nin: (val: any) => any,
    },
};