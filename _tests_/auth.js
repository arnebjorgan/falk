const falk = require('../dist/index');
const app = falk.createApp();

app.auth((req, database, accept, reject) => {
    if(req.body.userId) {
        accept({
            userId: req.body.userId,
        });
    }
    else {
        reject();
    }
});

app.model('cars', {
    userId: falk.field.string(),
}).expose((context, db) => {
    return context.auth?.userId === 'allowedUserId';
});

app.start();