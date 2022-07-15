const bason = require('../dist/index');
const app = bason();

app.authentication.public();

app.model({
    name: 'cars',
    fields: [
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();