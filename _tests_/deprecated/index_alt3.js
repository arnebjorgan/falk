import bason from 'bason';
const app = bason.mongodb(process.env.MONGODB_CONNECTIONSTRING);

const app = bason({
    database: 'mongodb',
    connectionString: process.env.MONGODB_CONNECTIONSTRING,
});

app.model({
    name: 'cars',
    optionalModelProperty1: 'foo',
    optionalModelProperty2: 'bar',
    fields: [
        { name: 'brand', type: 'string', required: true },
        { name: 'horsePower', type: 'number' },
        { name: 'electric', type: 'boolean' },
    ],
});

app.startServer();

//NEXT

//app.context.express
//app.context.expressApp
//app.context.database (?)
// app.get/post/put/patch/delete

app.use(middleware);

app.authentication({
    type: 'jwt',
    secret: process.env.JWT_SECRET,
    expirationMS: process.env.JWT_EXPIRATION_MS,
    endpoint: '/auth/login',
    fields: [
        { name: 'username', type: 'string', required: true },
        { name: 'password', type: 'string', required: true },
    ],
    authorization: () => {
        //check credentials etc
    },
    payloadProvider: () => {
        //return jwt payload
    },
});

app.authentication({
    type: 'apiKey',
    headerName: 'Authorization',
    headerValue: process.env.API_KEY,
});
