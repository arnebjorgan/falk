import { beforeAll, expect, test } from 'vitest';
import axios from 'axios';
import dayjs from 'dayjs';

const server = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
      Authorization: '123',
    },
});

const tesla = {
    brand: 'Tesla',
    horsepower: 480,
    electric: true,
    registered_date: '2022-01-01T00:00:00.000Z',
};

const toyota = {
    brand: 'Toyota',
    horsepower: 230,
    electric: false,
    registered_date: '2022-01-02T00:00:00.000Z', 
};

const ford = {
    brand: 'Ford',
    horsepower: 100,
    electric: false,
    registered_date: '2022-01-03T00:00:00.000Z', 
};

const volvo = {
    brand: 'Volvo',
    horsepower: 340,
    electric: false,
    registered_date: '2022-01-04T00:00:00.000Z', 
};

const bmw = {
    brand: 'BMW',
    horsepower: 340,
    electric: true,
    registered_date: '2022-01-05T00:00:00.000Z', 
};

beforeAll(async () => {
    const carsResponse = await server.get('/cars');
    await Promise.all(carsResponse.data.map(car => server.delete(`/cars/${car._id}`)));
    const allowResponse = await server.get('/allow-bar-and-reads');
    await Promise.all(allowResponse.data.map(allow => server.delete(`/allow-bar-and-reads/${allow._id}`)));
});

test('docs - it should return 200 on /docs', async () => {
    const response = await server.get('/docs');
    expect(response.status).toBe(200);
    expect(response.data).toBeTruthy();
});

test('expose - it should return 404 for non-exposed model', async () => {
    try {
        await server.get('/not-exposed');
        throw new Error('It should fail when getting a non-exposed model');
    } catch(e) {
        expect(e.response.status).toBe(404);
    }
});

test('allow - allow read and specific write', async () => {
    const postResponse = await server.post('/allow-bar-and-reads', { foo: 'bar' });
    expect(postResponse.status).toBe(200);
    expect(postResponse.data.foo).toEqual('bar');
    const getByIdResponse = await server.get(`/allow-bar-and-reads/${postResponse.data._id}`);
    expect(getByIdResponse.status).toBe(200);
    expect(getByIdResponse.data._id).toEqual(postResponse.data._id);
    const getManyResponse = await server.get('/allow-bar-and-reads');
    expect(getManyResponse.status).toBe(200);
    expect(getManyResponse.data.length).toEqual(1);
    expect(getManyResponse.data[0]._id).toEqual(postResponse.data._id);
});

test('allow - write not allowed', async () => {
    try {
        await server.post('/allow-bar-and-reads', { foo: 'forbidden' });
        throw new Error('It should fail when allow returns false');
    } catch(e) {
        expect(e.response.status).toBe(403);
        expect(e.response.data).toBe(`Operation is forbidden`);
    }
});

test('post - it should return 400 when one unknown field is sent', async () => {
    try {
        await server.post('/cars', { brand: 'foobar', foo: 123 });
        throw new Error('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed`);
    }
});

test('post - it should return 400 when required field is missing', async () => {
    try {
        await server.post('/cars', {});
        throw new Error('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required`);
    }
});

test('post - it should return 400 for invalid number', async () => {
    try {
        await server.post('/cars', { brand: 'foo', horsepower: 'foobar' });
        throw new Error('It should fail when posting an invalid number');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"horsepower" must be a number`);
    }
});

test('post - it should return 400 for invalid boolean', async () => {
    try {
        await server.post('/cars', { brand: 'foo', electric: 'foobar' });
        throw new Error('It should fail when posting an invalid boolean');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"electric" must be a boolean`);
    }
});

test('post - it should return 400 for invalid datetime', async () => {
    try {
        await server.post('/cars', { brand: 'foo', registered_date: 'invalid_date' });
        throw new Error('It should fail when posting an invalid datetime');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"registered_date" must be in ISO 8601 date format`);
    }
});

test('post - it should return 400 when multiple unknown fields are sent', async () => {
    try {
        await server.post('/cars', { brand: 'foo', foo: 123, bar: 456 });
        throw new Error('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed, "bar" is not allowed`);
    }
});

test('post - it should return 400 when required field is missing and unknown field is sent', async () => {
    try {
        await server.post('/cars', { foo: 123 });
        throw new Error('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required, "foo" is not allowed`);
    }
});

test('post - it should create a tesla car', async () => {
    const response = await server.post('/cars', tesla);
    tesla._id = response.data._id;
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(tesla);
    const getResponse = await server.get(`/cars/${response.data._id}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data).toStrictEqual(tesla);
});

test('getById - it should get tesla car by id', async () => {
    const response = await server.get(`/cars/${tesla._id}`);
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(tesla);
});

test('getById - it should return 404 for non existing id', async () => {
    try {
        await server.get(`/cars/123`);
        throw new Error('It should fail when getting car with non existing id');
    } catch(e) {
        expect(e.response.status).toBe(404);
        expect(e.response.data).toBe('Could not find cars with id 123');
    }
});

test('put - it should return 400 for invalid number', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', horsepower: 'foobar' });
        throw new Error('It should fail when puting an invalid number');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"horsepower" must be a number`);
    }
});

test('put - it should return 400 for invalid boolean', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', electric: 'foobar' });
        throw new Error('It should fail when puting an invalid boolean');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"electric" must be a boolean`);
    }
});

test('put - it should return 400 when required field is missing', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', {});
        throw new Error('It should fail when puting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required`);
    }
});

test('put - it should return 400 when required field is missing and unknown field is sent', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { foo: 123 });
        throw new Error('It should fail when puting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required, "foo" is not allowed`);
    }
});

test('put - it should return 400 when one unknown field is sent', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', foo: 123 });
        throw new Error('It should fail when puting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed`);
    }
});

test('put - it should return 400 when multiple unknown fields are sent', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', foo: 123, bar: 456 });
        throw new Error('It should fail when puting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed, "bar" is not allowed`);
    }
});

test('put - it should create a toyota car on a non existing id', async () => {
    const response = await server.put('/cars/6192caa940dd8aa6c0c21096', toyota);
    toyota._id = '6192caa940dd8aa6c0c21096';
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(toyota);
});

test('put - it should overwrite toyota car with ford', async () => {
    const response = await server.put('/cars/6192caa940dd8aa6c0c21096', ford);
    ford._id = '6192caa940dd8aa6c0c21096';
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(ford);
});

test('patch - it should return 400 for invalid number', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', {  horsepower: 'foobar' });
        throw new Error('It should fail when patching an invalid number');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"horsepower" must be a number`);
    }
});

test('patch - it should return 400 for invalid boolean', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { electric: 'foobar' });
        throw new Error('It should fail when patching an invalid boolean');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"electric" must be a boolean`);
    }
});

test('patch - it should return 400 when one unknown field is sent', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { foo: 123 });
        throw new Error('It should fail when patching an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed`);
    }
});

test('patch - it should return 400 when multiple unknown fields are sent', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { foo: 123, bar: 456 });
        throw new Error('It should fail when patching an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed, "bar" is not allowed`);
    }
});

test('patch - it should return 400 when required field is set to null', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { brand: null });
        throw new Error('It should fail when patching with required field set to null');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" must be a string`);
    }
});

test('patch - it should return 404 for non existing car', async () => {
    try {
        await server.patch(`cars/6192cb96c7345a34b68aada8`, { electric: true });
        throw new Error('It should fail when patching car with non existing id');
    } catch(e) {
        expect(e.response.status).toBe(404);
        expect(e.response.data).toBe('Could not find cars with id 6192cb96c7345a34b68aada8');
    }
});

test('patch - it should patch fields on existing car', async () => {
    const response = await server.patch(`cars/6192caa940dd8aa6c0c21096`, { electric: true, horsepower: 1000, brand: 'NotFord' });
    ford.electric = true;
    ford.horsepower = 1000;
    ford.brand = 'NotFord';
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(ford);
    const getResponse = await server.get(`cars/6192caa940dd8aa6c0c21096`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data).toStrictEqual(ford);
});

test('delete - it should return 404 for non existing car', async () => {
    try {
        await server.delete(`cars/6192cb96c7345a34b68aada8`);
        throw new Error('It should fail when patching car with non existing id');
    } catch(e) {
        expect(e.response.status).toBe(404);
        expect(e.response.data).toBe('Could not find cars with id 6192cb96c7345a34b68aada8');
    }
});

test('delete - it should delete existing car', async () => {
    const response = await server.delete(`cars/6192caa940dd8aa6c0c21096`);
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual(ford);
    try {
        await server.get(`cars/6192caa940dd8aa6c0c21096`);
        throw new Error('It should fail when getting newly deleted car by id');
    } catch(e) {
        expect(e.response.status).toBe(404);
        expect(e.response.data).toBe('Could not find cars with id 6192caa940dd8aa6c0c21096');
    }
});

test('getMany - it should return all cars', async () => {
    const postVolvoResponse = await server.post('/cars', volvo);
    volvo._id = postVolvoResponse.data._id;
    const postBmwResponse = await server.post('/cars', bmw);
    bmw._id = postBmwResponse.data._id;
    const response = await server.get(`/cars`);
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data).toContainEqual(tesla);
    expect(response.data).toContainEqual(volvo);
    expect(response.data).toContainEqual(bmw);
});

test('getMany - default sort', async () => {
    const response = await server.get('/cars?_sort=brand');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data[0]).toStrictEqual(bmw);
    expect(response.data[1]).toStrictEqual(tesla);
    expect(response.data[2]).toStrictEqual(volvo);
});

test('getMany - asc sort', async () => {
    const response = await server.get('/cars?_sort=brand|asc');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data[0]).toStrictEqual(bmw);
    expect(response.data[1]).toStrictEqual(tesla);
    expect(response.data[2]).toStrictEqual(volvo);
});

test('getMany - desc sort', async () => {
    const response = await server.get('/cars?_sort=brand|desc');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data[0]).toStrictEqual(volvo);
    expect(response.data[1]).toStrictEqual(tesla);
    expect(response.data[2]).toStrictEqual(bmw);
});

test('getMany - complex sort 1', async () => {
    const response = await server.get('/cars?_sort=horsepower|desc&_sort=brand');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data[0]).toStrictEqual(tesla);
    expect(response.data[1]).toStrictEqual(bmw);
    expect(response.data[2]).toStrictEqual(volvo);
});

test('getMany - complex sort 2', async () => {
    const response = await server.get('/cars?_sort=horsepower|asc&_sort=brand|desc');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data[0]).toStrictEqual(volvo);
    expect(response.data[1]).toStrictEqual(bmw);
    expect(response.data[2]).toStrictEqual(tesla);
});

test('getMany - limit', async () => {
    const response = await server.get('/cars?_limit=2');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
});

test('getMany - skip', async () => {
    const response = await server.get('/cars?_skip=1');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
});

test('getMany - sort + skip', async () => {
    const response = await server.get('/cars?_sort=brand&_skip=1');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data[0]).toStrictEqual(tesla);
    expect(response.data[1]).toStrictEqual(volvo);
});

test('getMany - sort + limit', async () => {
    const response = await server.get('/cars?_sort=brand&_limit=2');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data[0]).toStrictEqual(bmw);
    expect(response.data[1]).toStrictEqual(tesla);
});

test('getMany - skip + limit + sort', async () => {
    const response = await server.get('/cars?_sort=brand&_limit=2&_skip=1');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data[0]).toStrictEqual(tesla);
    expect(response.data[1]).toStrictEqual(volvo);
});

test('getMany - equal number filter', async () => {
    const response = await server.get('/cars?horsepower=480');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - not equal number filter', async () => {
    const response = await server.get('/cars?horsepower|ne=340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - greater than number filter', async () => {
    const response = await server.get('/cars?horsepower|gt=340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - greater than or equal number filter', async () => {
    const response = await server.get('/cars?horsepower|gte=480');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - less than number filter', async () => {
    const response = await server.get('/cars?horsepower|lt=480');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - less than or equal number filter', async () => {
    const response = await server.get('/cars?horsepower|lte=340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - in number filter', async () => {
    const response = await server.get('/cars?horsepower|in=1,2,340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - not in number filter', async () => {
    const response = await server.get('/cars?horsepower|nin=480');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - equal string filter', async () => {
    const response = await server.get('/cars?brand=Tesla');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - not equal string filter', async () => {
    const response = await server.get('/cars?brand|ne=Tesla');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - in string filter', async () => {
    const response = await server.get('/cars?brand|in=Volvo,Tesla');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(volvo);
    expect(response.data).toContainEqual(tesla);
});

test('getMany - not in string filter', async () => {
    const response = await server.get('/cars?brand|nin=BMW,Volvo');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - like string filter', async () => {
    const response = await server.get('/cars?brand|like=esl');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - equal boolean filter', async () => {
    const response = await server.get('/cars?electric=true');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(tesla);
    expect(response.data).toContainEqual(bmw);
});

test('getMany - not equal boolean filter', async () => {
    const response = await server.get('/cars?electric|ne=false');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(tesla);
    expect(response.data).toContainEqual(bmw);
});

test('getMany - in boolean filter', async () => {
    const response = await server.get('/cars?electric|in=true');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(tesla);
});

test('getMany - not in boolean filter', async () => {
    const response = await server.get('/cars?electric|nin=false');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(tesla);
});

test('getMany - equal datetime filter', async () => {
    const response = await server.get('/cars?registered_date=2022-01-01T00:00:00.000Z');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data).toContainEqual(tesla);
});

test('getMany - not equal datetime filter', async () => {
    const response = await server.get('/cars?registered_date|ne=2022-01-01T00:00:00.000Z');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(volvo);
    expect(response.data).toContainEqual(bmw);
});

test('getMany - in datetime filter', async () => {
    const response = await server.get('/cars?registered_date|in=2022-01-01T00:00:00.000Z');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data).toContainEqual(tesla);
});

test('getMany - not in datetime filter', async () => {
    const response = await server.get('/cars?registered_date|nin=2022-01-01T00:00:00.000Z');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(volvo);
    expect(response.data).toContainEqual(bmw);
});

test('getMany - invalid string _skip', async () => {
    try {
        await server.get('/cars?_skip=foobar');
        throw new Error('It should fail when using invalid _skip');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_skip must be a positive integer, is NaN`);
    }
});

test('getMany - invalid float _skip', async () => {
    try {
        await server.get('/cars?_skip=1.2');
        throw new Error('It should fail when using invalid _skip');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_skip must be a positive integer, is 1.2`);
    }
});

test('getMany - invalid negative _skip', async () => {
    try {
        await server.get('/cars?_skip=-3');
        throw new Error('It should fail when using invalid _skip');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_skip must be a positive integer, is -3`);
    }
});

test('getMany - invalid string _limit', async () => {
    try {
        await server.get('/cars?_limit=foobar');
        throw new Error('It should fail when using invalid _limit');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_limit must be a positive integer, is NaN`);
    }
});

test('getMany - invalid float _limit', async () => {
    try {
        await server.get('/cars?_limit=1.2');
        throw new Error('It should fail when using invalid _limit');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_limit must be a positive integer, is 1.2`);
    }
});

test('getMany - invalid negative _limit', async () => {
    try {
        await server.get('/cars?_limit=-3');
        throw new Error('It should fail when using invalid _limit');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_limit must be a positive integer, is -3`);
    }
});

test('getMany - invalid _skip and _limit', async () => {
    try {
        await server.get('/cars?_skip=foo&_limit=bar');
        throw new Error('It should fail when using invalid skip and limit values');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_skip must be a positive integer, is NaN, _limit must be a positive integer, is NaN`);
    }
});

test('getMany - non existing _sort field', async () => {
    try {
        await server.get('/cars?_sort=foobar');
        throw new Error('It should fail when using non existing _sort field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_sort field foobar does not exist, must be one of [brand, horsepower, electric, registered_date]`);
    }
});

test('getMany - non existing filter key', async () => {
    try {
        await server.get('/cars?foo=bar');
        throw new Error('It should fail when using non existing filter field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`filter field foo does not exist, must be one of [brand, horsepower, electric, registered_date]`);
    }
});

test('getMany - invalid number filter', async () => {
    try {
        await server.get('/cars?horsepower=foobar');
        throw new Error('It should fail when using invalid number filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`horsepower filter must be a number, was foobar`);
    }
});

test('getMany - invalid number in filter', async () => {
    try {
        await server.get('/cars?horsepower|in=123,foo');
        throw new Error('It should fail when using invalid number filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`horsepower filter must be a number, was foo`);
    }
});

test('getMany - invalid number nin filter', async () => {
    try {
        await server.get('/cars?horsepower|nin=foo,123');
        throw new Error('It should fail when using invalid number filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`horsepower filter must be a number, was foo`);
    }
});

test('getMany - invalid boolean filter', async () => {
    try {
        await server.get('/cars?electric=foobar');
        throw new Error('It should fail when using invalid boolean filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`electric filter must be a boolean, was foobar`);
    }
});

test('getMany - invalid boolean in filter', async () => {
    try {
        await server.get('/cars?electric|in=true,foo');
        throw new Error('It should fail when using invalid boolean filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`electric filter must be a boolean, was foo`);
    }
});

test('getMany - invalid boolean nin filter', async () => {
    try {
        await server.get('/cars?electric|nin=true,foo,false,bar');
        throw new Error('It should fail when using invalid boolean filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`electric filter must be a boolean, was foo, electric filter must be a boolean, was bar`);
    }
});