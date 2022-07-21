const falk = require('../dist/index');
const app = falk();

app.authentication.jwt({
    secret: 'secret',
    authEndpoint: '/auth/login',
    authCheck: async (req, accept, reject) => {
        if(req.body.username === 'foo') {
            accept({
                username: 'foo',
            });
        }
        else {
            reject();
        }
    },
    tokenExpirationMS: 360000,
});

app.model({
    name: 'cars',
    fields: [
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();