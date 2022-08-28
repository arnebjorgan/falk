import { MongoMemoryServer } from 'mongodb-memory-server';
import mongodb from './mongodb';
import { Database, Model } from '../definitions';

export default async (databaseConfiguration: any, models: Model[]) : Promise<Database> => {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    return mongodb(uri, models);
};