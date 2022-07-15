const bason = require('../dist/index');
require('dotenv').config();

const databaseType = process.argv[2];

const app = bason();

if(databaseType === 'memory') {
    app.database.memory();
}
else if(databaseType === 'mongodb') {
    app.database.mongodb(process.env.MONGODB_CONNECTIONSTRING);
}

app.model({
    name: 'cars',
    fields: [
        { name: 'brand', type: 'string', required: true },
        { name: 'horsePower', type: 'number' },
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();