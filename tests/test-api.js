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

app.model('cars', {
    brand: field.string().required(),
    horsepower: field.number(),
    electric: field.boolean(),
    registered_date: field.datetime(),
}).expose((context, database) => {
    if(context.auth.userId) {
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

app.start(5000);