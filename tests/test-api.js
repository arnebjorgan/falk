import { createApp, field } from '../index.js';

const app = createApp();

app.auth((accept, reject, expressReq) => {
    if(expressReq.get('Authorization')) {
        accept({
            userId: expressReq.get('Authorization'),
        });
    }
    else {
        reject();
    }
});

app.middleware((req, res, next, database) => {
    if(req.get('Authorization') === 'test-middleware') {
        res.status(200).send({
            message: 'Message from middleware',
        });
    }
    else {
        next();
    }
});

app.model('cars', {
    brand: field.string().required(),
    horsepower: field.number(),
    electric: field.boolean(),
    registered_date: field.datetime(),
}).expose((context, database) => {
    if(context.auth.userId === '123') {
        return true;
    }
    return false;
});

app.model('not-exposed', {
    foo: field.string(),
});

app.model('allow-bar-and-reads', {
    foo: field.string(),
}).expose((context, db) => {
    if(context.operation.write) return context.data.foo === 'bar';
    else if(context.operation.read) return true;
    else return false;
});

app.model('trigger_logs', {
    trigger_id: field.string(),
    trigger_type: field.string(),
}).expose((context, db) => {
    return true;
});

app.model('triggers', {}).expose((context, db) => {
    return true;
}).onCreate(async (context, db) => {
    await db.model('trigger_logs').create({
        trigger_id: context.id,
        trigger_type: 'create',
    });
}).onUpdate(async (context, db) => {
    await db.model('trigger_logs').create({
        trigger_id: context.id,
        trigger_type: 'update',
    });
}).onDelete(async (context, db) => {
    await db.model('trigger_logs').create({
        trigger_id: context.id,
        trigger_type: 'delete',
    });
});

app.get('/custom_endpoint', (req, res, next, db) => {
    res.status(200).send('ok');
});

app.post('/custom_endpoint', (req, res, next, db) => {
    res.status(200).send('ok');
});

app.put('/custom_endpoint', (req, res, next, db) => {
    res.status(200).send('ok');
});

app.patch('/custom_endpoint', (req, res, next, db) => {
    res.status(200).send('ok');
});

app.delete('/custom_endpoint', (req, res, next, db) => {
    res.status(200).send('ok');
});

app.start(5000);