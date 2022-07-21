const falk = require('../dist/index');
const app = falk();

app.authentication.public();

app.model({
    name: 'cars',
    fields: [
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();