import bason from 'bason';
const app = bason.mongodb(process.env.MONGODB_CONNECTIONSTRING);

app.use(middleware);

app.model('cars', {
    optionalModelProperty1: 'foo',
    optionalModelProperty2: 'bar',
    fields: [
        { name: 'brand', type: 'string', required: true },
        { name: 'horsePower', type: 'number' },
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();