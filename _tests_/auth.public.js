const falk = require('../dist/index');
const app = falk.default();

app.authentication.public();

app.model('cars', {
    electric: falk.fieldType.boolean(),
}, {
    expose: true,
});

app.startServer();