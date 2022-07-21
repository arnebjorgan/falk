const falk = require('../dist/index');
const app = falk();

app.authentication.apiKey({
    key: 'secret',
    headerName: 'Api-Key',
});

app.model({
    name: 'cars',
    fields: [
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();