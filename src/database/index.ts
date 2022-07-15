import { Database, DatabaseType, Model } from '../definitions';
import mongodb from './mongodb';
import memory from './memory';
const databases = {
    mongodb,
    memory,
};

export default async (databaseType: DatabaseType, databaseConfiguration : any, models: Model[]) : Promise<Database> => {
    if(!databases[databaseType]) {
        console.error(`Database type ${databaseType} is not supported`);
        process.exit(1)
    }
    else {
        try {
            const database = await databases[databaseType](databaseConfiguration, models);
            console.info(`Connected to ${databaseType} database ✅`);
            return database;
        } catch(e) {
            console.error(`Could not connect to ${databaseType} database`);
            process.exit(1);
        }
    }
};