const falk = require('../dist/index.js');
const dotenv = require('dotenv');
dotenv.config();

const databaseType = process.argv[2];

const app = falk.createApp();

app.cors();

if(databaseType === 'memory') {
    app.database.memory();
}
else if(databaseType === 'mongodb') {
    app.database.mongodb(process.env.MONGODB_CONNECTIONSTRING);
}

app.model('cars', {
    brand: falk.field.string().required(),
    horsePower: falk.field.number(),
    electric: falk.field.boolean(),
    registered_date: falk.field.datetime(),
    bodywork: falk.field.string().validator(val => ['suv', 'sedan', 'station_wagon'].includes(val)),
}).expose(() => true);

app.model('brands', {
    name: falk.field.string(),
    created_at: falk.field.auto.createdAt(),
    updated_at: falk.field.auto.updatedAt(),
}).expose(() => true);

app.model('not-exposed', {
    foo: falk.field.string(),
});

app.model('allow-bar-and-reads', {
    foo: falk.field.string(),
}).expose((context, db) => {
    if(context.operation.write) return context.data.foo === 'bar';
    else if(context.operation.read) return true;
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

app.start();