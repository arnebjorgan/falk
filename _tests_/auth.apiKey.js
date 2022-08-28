const falk = require('../dist/index');
const app = falk.default();

app.authentication.apiKey({
    key: 'secret',
    headerName: 'Api-Key',
});

app.model('cars', {
    electric: falk.fieldType.boolean(),
}, {
    expose: true,
});

app.startServer();