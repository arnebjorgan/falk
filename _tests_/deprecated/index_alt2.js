import falk from 'falk';
const app = falk.mongodb(process.env.MONGODB_CONNECTIONSTRING);

app.use(middleware);

app.model('cars', [
    { name: 'brand', type: 'string', required: true },
    { name: 'horsePower', type: 'number' },
    { name: 'electric', type: 'boolean' },
], {
    optionalModelProperty1: 'foo',
    optionalModelProperty2: 'bar',
});

app.startServer();