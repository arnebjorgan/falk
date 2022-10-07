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

app.model('cars', {
    brand: falk.fieldType.string({ required: true }),
    horsePower: falk.fieldType.number(),
    electric: falk.fieldType.boolean(),
    registered_date: falk.fieldType.datetime(),
    bodywork: falk.fieldType.string({ validator: val => ['suv', 'sedan', 'station_wagon'].includes(val) }),
}).expose(() => true);

app.model('brands', {
    name: falk.fieldType.string(),
    created_at: falk.fieldType.auto.createdAt(),
    updated_at: falk.fieldType.auto.updatedAt(),
}).expose(() => true);

app.model('not-exposed', {
    foo: falk.fieldType.string(),
});

app.model('allow-bar-and-reads', {
    foo: falk.fieldType.string(),
}).expose((request, resource, operation, db) => {
    if(operation.write) return request.resource.data.foo === 'bar';
    else if(operation.read) return true;
    else return false;
});

app.get('/manual-endpoint', (req, res, next, db) => {
    res.send('ok');
});

app.post('/manual-endpoint', (req, res, next, db) => {
    res.send('ok');
});

app.put('/manual-endpoint', (req, res, next, db) => {
    res.send('ok');
});

app.patch('/manual-endpoint', (req, res, next, db) => {
    res.send('ok');
});

app.delete('/manual-endpoint', (req, res, next, db) => {
    res.send('ok');
});

app.startServer();