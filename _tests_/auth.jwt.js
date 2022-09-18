const falk = require('../dist/index');
const app = falk.default();

app.authentication.jwt({
    secret: 'secret',
    authEndpoint: '/auth/login',
    authCheck: async (req, acceptUser, rejectUser) => {
        if(req.body.username === 'foo') {
            acceptUser({
                username: 'foo',
            });
        }
        else {
            rejectUser();
        }
    },
    tokenExpirationMS: 360000,
});

app.model('cars', {
    electric: falk.fieldType.boolean(),
}, {
    expose: true,
});

app.startServer();