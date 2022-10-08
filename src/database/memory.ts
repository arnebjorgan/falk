import { MongoMemoryServer } from 'mongodb-memory-server';
import mongodb from './mongodb';
import { Database, DatabaseFactory, Model } from '../definitions';

export default () : DatabaseFactory => {
    return async(models: Model[]) : Promise<Database> => {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const database = mongodb(uri);
        return await database(models);
    }
};