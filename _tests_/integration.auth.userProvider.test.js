const axios = require('axios');

const server = axios.create({
    baseURL: 'http://localhost:8080',
});

test('rejectUser is called - should return 401', async () => {
    try {
        const response = await server.post('/cars');
        fail('It should fail when sending request userId');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe('User is not authorized');
    }
});

test('acceptUser is called - it should return 200', async () => {
    const response = await server.post('/cars', { userId: 'foobar' });
    expect(response.status).toBe(200);
    expect(response.data).not.toBeUndefined();
    expect(response.data).not.toBeNull();
});