const falconwing = require('../dist/index');
const app = falconwing();

app.authentication.public();

app.model({
    name: 'cars',
    fields: [
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();