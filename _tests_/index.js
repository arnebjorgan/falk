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
        { name: 'brand', type: falk.fieldType.STRING, required: true },
        { name: 'horsePower', type: falk.fieldType.NUMBER },
        { name: 'electric', type: falk.fieldType.BOOLEAN },
        { name: 'registered_date', type: falk.fieldType.DATETIME },
    ],
});

app.model({
    name: 'not-exposed',
    fields: [
        { name: 'foo', type: falk.fieldType.STRING },
    ],
});

app.endpoint.get('/manual-endpoint', (req, res, next) => {
    res.send('ok');
});

app.endpoint.post('/manual-endpoint', (req, res, next) => {
    res.send('ok');
});

app.endpoint.put('/manual-endpoint', (req, res, next) => {
    res.send('ok');
});

app.endpoint.patch('/manual-endpoint', (req, res, next) => {
    res.send('ok');
});

app.endpoint.delete('/manual-endpoint', (req, res, next) => {
    res.send('ok');
});

app.startServer();