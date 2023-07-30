import { MongoMemoryServer } from 'mongodb-memory-server';
import mongodb from './mongodb.js';

export default () => async(models) => {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const database = mongodb(uri);
    return await database(models);
};