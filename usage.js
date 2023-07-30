import { createApp, field} from './index.js';

const app = createApp();

app.cors(true);

app.model('cars', {
    brand: field.string().required(),
    electric: field.boolean(),
    horsepower: field.number(),
}).expose(({ operation }, database) => {
    console.log(operation);
    return true;
});

app.start();