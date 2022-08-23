const axios = require('axios');

const server = axios.create({
    baseURL: 'http://localhost:8080',
});

const tesla = {
    brand: 'Tesla',
    horsePower: 480,
    electric: true,
    registered_date: '2022-01-01T00:00:00.000Z',
    bodywork: 'sedan',
};

const toyota = {
    brand: 'Toyota',
    horsePower: 230,
    electric: false,
    registered_date: '2022-01-02T00:00:00.000Z', 
};

const ford = {
    brand: 'Ford',
    horsePower: 100,
    electric: false,
    registered_date: '2022-01-03T00:00:00.000Z', 
};

const volvo = {
    brand: 'Volvo',
    horsePower: 340,
    electric: false,
    registered_date: '2022-01-04T00:00:00.000Z', 
};

const bmw = {
    brand: 'BMW',
    horsePower: 340,
    electric: true,
    registered_date: '2022-01-05T00:00:00.000Z', 
};

beforeAll(async () => {
    const carsResponse = await server.get('/cars');
    await Promise.all(carsResponse.data.map(car => server.delete(`/cars/${car._id}`)));
});

test('docs - it should return 200 on root', async () => {
    const response = await server.get('/');
    expect(response.status).toBe(200);
    expect(response.data).not.toBeUndefined();
    expect(response.data).not.toBeNull();
});

test('expose - it should return 404 for non-exposed model', async () => {
    try {
        await server.get('/not-exposed');
        fail('It should fail when getting a non-exposed model');
    } catch(e) {
        expect(e.response.status).toBe(404);
    }
});

test('post - it should return 400 when one unknown field is sent', async () => {
    try {
        await server.post('/cars', { brand: 'foobar', foo: 123 });
        fail('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed`);
    }
});

test('post - it should return 400 when required field is missing', async () => {
    try {
        await server.post('/cars', {});
        fail('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required`);
    }
});


test('post - it should return 400 for invalid number', async () => {
    try {
        await server.post('/cars', { brand: 'foo', horsePower: 'foobar' });
        fail('It should fail when posting an invalid number');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"horsePower" must be a number`);
    }
});

test('post - it should return 400 for invalid boolean', async () => {
    try {
        await server.post('/cars', { brand: 'foo', electric: 'foobar' });
        fail('It should fail when posting an invalid boolean');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"electric" must be a boolean`);
    }
});

test('post - it should return 400 for invalid datetime', async () => {
    try {
        await server.post('/cars', { brand: 'foo', registered_date: 'invalid_date' });
        fail('It should fail when posting an invalid datetime');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"registered_date" must be in ISO 8601 date format`);
    }
});

test('post - it should return 400 when multiple unknown fields are sent', async () => {
    try {
        await server.post('/cars', { brand: 'foo', foo: 123, bar: 456 });
        fail('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed, "bar" is not allowed`);
    }
});

test('post - it should return 400 when required field is missing and unknown field is sent', async () => {
    try {
        await server.post('/cars', { foo: 123 });
        fail('It should fail when posting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required, "foo" is not allowed`);
    }
});

test('post - it should return 400 when custom field validator fails', async () => {
    try {
        await server.post('/cars', { brand: 'foo', bodywork: 'suuuv' });
        fail('It should fail when posting with custom validator failing');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"bodywork" does not match all of the required types`);
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
        fail('It should fail when getting car with non existing id');
    } catch(e) {
        expect(e.response.status).toBe(404);
        expect(e.response.data).toBe('Could not find cars with id 123');
    }
});

test('put - it should return 400 for invalid number', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', horsePower: 'foobar' });
        fail('It should fail when puting an invalid number');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"horsePower" must be a number`);
    }
});

test('put - it should return 400 for invalid boolean', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', electric: 'foobar' });
        fail('It should fail when puting an invalid boolean');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"electric" must be a boolean`);
    }
});

test('put - it should return 400 when required field is missing', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', {});
        fail('It should fail when puting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required`);
    }
});

test('put - it should return 400 when required field is missing and unknown field is sent', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { foo: 123 });
        fail('It should fail when puting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" is required, "foo" is not allowed`);
    }
});

test('put - it should return 400 when one unknown field is sent', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', foo: 123 });
        fail('It should fail when puting an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed`);
    }
});

test('put - it should return 400 when multiple unknown fields are sent', async () => {
    try {
        await server.put('/cars/6192caa940dd8aa6c0c21096', { brand: 'foo', foo: 123, bar: 456 });
        fail('It should fail when puting an unknown field');
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
        await server.patch('/cars/6192caa940dd8aa6c0c21096', {  horsePower: 'foobar' });
        fail('It should fail when patching an invalid number');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"horsePower" must be a number`);
    }
});

test('patch - it should return 400 for invalid boolean', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { electric: 'foobar' });
        fail('It should fail when patching an invalid boolean');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"electric" must be a boolean`);
    }
});

test('patch - it should return 400 when one unknown field is sent', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { foo: 123 });
        fail('It should fail when patching an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed`);
    }
});

test('patch - it should return 400 when multiple unknown fields are sent', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { foo: 123, bar: 456 });
        fail('It should fail when patching an unknown field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"foo" is not allowed, "bar" is not allowed`);
    }
});

test('patch - it should return 400 when required field is set to null', async () => {
    try {
        await server.patch('/cars/6192caa940dd8aa6c0c21096', { brand: null });
        fail('It should fail when patching with required field set to null');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"brand" must be a string`);
    }
});

test('patch - it should return 404 for non existing car', async () => {
    try {
        await server.patch(`cars/6192cb96c7345a34b68aada8`, { electric: true });
        fail('It should fail when patching car with non existing id');
    } catch(e) {
        expect(e.response.status).toBe(404);
        expect(e.response.data).toBe('Could not find cars with id 6192cb96c7345a34b68aada8');
    }
});

test('patch - it should patch fields on existing car', async () => {
    const response = await server.patch(`cars/6192caa940dd8aa6c0c21096`, { electric: true, horsePower: 1000, brand: 'NotFord' });
    ford.electric = true;
    ford.horsePower = 1000;
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
        fail('It should fail when patching car with non existing id');
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
        fail('It should fail when getting newly deleted car by id');
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
    const response = await server.get('/cars?_sort=horsePower|desc&_sort=brand');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(3);
    expect(response.data[0]).toStrictEqual(tesla);
    expect(response.data[1]).toStrictEqual(bmw);
    expect(response.data[2]).toStrictEqual(volvo);
});

test('getMany - complex sort 2', async () => {
    const response = await server.get('/cars?_sort=horsePower|asc&_sort=brand|desc');
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
    const response = await server.get('/cars?horsePower=480');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - not equal number filter', async () => {
    const response = await server.get('/cars?horsePower|ne=340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - greater than number filter', async () => {
    const response = await server.get('/cars?horsePower|gt=340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - greater than or equal number filter', async () => {
    const response = await server.get('/cars?horsePower|gte=480');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
    expect(response.data[0]).toStrictEqual(tesla);
});

test('getMany - less than number filter', async () => {
    const response = await server.get('/cars?horsePower|lt=480');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - less than or equal number filter', async () => {
    const response = await server.get('/cars?horsePower|lte=340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - in number filter', async () => {
    const response = await server.get('/cars?horsePower|in=1,2,340');
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(2);
    expect(response.data).toContainEqual(bmw);
    expect(response.data).toContainEqual(volvo);
});

test('getMany - not in number filter', async () => {
    const response = await server.get('/cars?horsePower|nin=480');
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
        fail('It should fail when using invalid _skip');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"_skip" must be a number`);
    }
});

test('getMany - invalid float _skip', async () => {
    try {
        await server.get('/cars?_skip=1.2');
        fail('It should fail when using invalid _skip');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"_skip" must be an integer`);
    }
});

test('getMany - invalid negative _skip', async () => {
    try {
        await server.get('/cars?_skip=-3');
        fail('It should fail when using invalid _skip');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"_skip" must be a positive number`);
    }
});

test('getMany - invalid string _limit', async () => {
    try {
        await server.get('/cars?_limit=foobar');
        fail('It should fail when using invalid _limit');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"_limit" must be a number`);
    }
});

test('getMany - invalid float _limit', async () => {
    try {
        await server.get('/cars?_limit=1.2');
        fail('It should fail when using invalid _limit');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"_limit" must be an integer`);
    }
});

test('getMany - invalid negative _limit', async () => {
    try {
        await server.get('/cars?_limit=-3');
        fail('It should fail when using invalid _limit');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"_limit" must be a positive number`);
    }
});

test('getMany - invalid _skip and _limit', async () => {
    try {
        await server.get('/cars?_skip=foo&_limit=bar');
        fail('It should fail when using invalid skip and limit values');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`"_skip" must be a number, "_limit" must be a number`);
    }
});

test('getMany - non existing _sort field', async () => {
    try {
        await server.get('/cars?_sort=foobar');
        fail('It should fail when using non existing _sort field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`_sort field foobar does not exist, must be one of [brand, horsePower, electric, registered_date, bodywork]`);
    }
});

test('getMany - non existing filter key', async () => {
    try {
        await server.get('/cars?foo=bar');
        fail('It should fail when using non existing filter field');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`filter field foo does not exist, must be one of [brand, horsePower, electric, registered_date, bodywork]`);
    }
});

test('getMany - invalid number filter', async () => {
    try {
        await server.get('/cars?horsePower=foobar');
        fail('It should fail when using invalid number filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`horsePower filter must be a number, was foobar`);
    }
});

test('getMany - invalid number in filter', async () => {
    try {
        await server.get('/cars?horsePower|in=123,foo');
        fail('It should fail when using invalid number filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`horsePower filter must be a number, was foo`);
    }
});

test('getMany - invalid number nin filter', async () => {
    try {
        await server.get('/cars?horsePower|nin=foo,123');
        fail('It should fail when using invalid number filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`horsePower filter must be a number, was foo`);
    }
});

test('getMany - invalid boolean filter', async () => {
    try {
        await server.get('/cars?electric=foobar');
        fail('It should fail when using invalid boolean filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`electric filter must be a boolean, was foobar`);
    }
});

test('getMany - invalid boolean in filter', async () => {
    try {
        await server.get('/cars?electric|in=true,foo');
        fail('It should fail when using invalid boolean filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`electric filter must be a boolean, was foo`);
    }
});

test('getMany - invalid boolean nin filter', async () => {
    try {
        await server.get('/cars?electric|nin=0,1,false,bar');
        fail('It should fail when using invalid boolean filter');
    } catch(e) {
        expect(e.response.status).toBe(400);
        expect(e.response.data).toBe(`electric filter must be a boolean, was 0, electric filter must be a boolean, was 1, electric filter must be a boolean, was bar`);
    }
});

test('manual endpoint - it should return 200 ok for GET', async () => {
    const response = await server.get('/manual-endpoint');
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual('ok');
});

test('manual endpoint - it should return 200 ok for POST', async () => {
    const response = await server.post('/manual-endpoint');
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual('ok');
});

test('manual endpoint - it should return 200 ok for PUT', async () => {
    const response = await server.put('/manual-endpoint');
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual('ok');
});

test('manual endpoint - it should return 200 ok for PATCH', async () => {
    const response = await server.patch('/manual-endpoint');
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual('ok');
});

test('manual endpoint - it should return 200 ok for DELETE', async () => {
    const response = await server.delete('/manual-endpoint');
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual('ok');
});