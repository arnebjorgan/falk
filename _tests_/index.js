const falk = require('../dist/index.js');
const dotenv = require('dotenv');
dotenv.config();

const databaseType = process.argv[2];

const app = falk.default();

if(databaseType === 'memory') {
    app.database.memory();
}
else if(databaseType === 'mongodb') {
    app.database.mongodb(process.env.MONGODB_CONNECTIONSTRING);
}

app.model({
    name: 'cars',
    expose: true,
    fields: [
        { name: 'brand', type: 'string', required: true },
        { name: 'horsePower', type: 'number' },
        { name: 'electric', type: 'boolean' },
    ],
});

app.model({
    name: 'not-exposed',
    fields: [
        { name: 'foo', type: 'string' },
    ],
});

app.startServer();