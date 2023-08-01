import { createApp, field} from './index.js';

const app = createApp();

app.cors(true);

app.auth((accept, reject, expressReq, db) => {
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
    electric: field.boolean(),
    horsepower: field.number(),
}).expose((context, database) => {
    if(context.auth.userId) {
        return true;
    }
    return false;
});

app.start();