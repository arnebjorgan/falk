const axios = require('axios');

const server = axios.create({
    baseURL: 'http://localhost:8080',
});

test('missing header - it should return 401', async () => {
    try {
        const response = await server.get('/');
        fail('It should fail when sending request without api key header');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe(`Request header 'Api-Key' for API key authentication is missing`);
    }
});

test('wrong key - it should return 401', async () => {
    try {
        const response = await server.get('/', { headers: { 'Api-Key': 'wrong' } });
        fail('It should fail when sending request with wrong api key');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe(`Request header 'Api-Key' has wrong API key`);
    }
});

test('auth ok - it should return 200', async () => {
    const response = await server.get('/', { headers: { 'Api-Key': 'secret' } });
    expect(response.status).toBe(200);
    expect(response.data).not.toBeUndefined();
    expect(response.data).not.toBeNull();
});