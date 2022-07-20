const falconwing = require('../dist/index');
const app = falconwing();

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