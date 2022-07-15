import bason from 'bason';

bason({
    database: {
        type: 'mongodb',
        connectionString: process.env.MONGODB_CONNECTIONSTRING,
    },
    middlewares: [],
    models: [
        {
            name: 'cars',
            optionalModelProperty1: 'foo',
            optionalModelProperty2: 'bar',
            fields: [
                { name: 'brand', type: 'string', required: true },
                { name: 'horsePower', type: 'number' },
                { name: 'electric', type: 'boolean' },
            ],
        },
    ],
}).startServer();