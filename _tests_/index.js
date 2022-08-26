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
        { name: 'bodywork', type: falk.fieldType.STRING, validator: val => ['suv', 'sedan', 'station_wagon'].includes(val) },
    ],
});

app.model({
    name: 'brands',
    expose: true,
    fields: [
        { name: 'name', type: falk.fieldType.STRING },
        { name: 'created_at', type: falk.fieldType.AUTO_CREATED_AT },
        { name: 'updated_at', type: falk.fieldType.AUTO_UPDATED_AT },
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