const axios = require('axios');

const server = axios.create({
    baseURL: 'http://localhost:8080',
});

test('it should return 200', async () => {
    const response = await server.get('/');
    expect(response.status).toBe(200);
    expect(response.data).not.toBeUndefined();
    expect(response.data).not.toBeNull();
});