const axios = require('axios');

const server = axios.create({
    baseURL: 'http://localhost:8080',
});

test('rejectUser is called - should return 401', async () => {
    try {
        const response = await server.post('/cars');
        fail('It should fail when not sending request userId');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe('User is not authorized');
    }
});

test('acceptUser is called - it should return 200', async () => {
    const response = await server.post('/cars', { userId: 'allowedUserId' });
    expect(response.status).toBe(200);
    expect(response.data).not.toBeUndefined();
    expect(response.data).not.toBeNull();
});

test('model operation rejected - should return 403', async () => {
    try {
        const response = await server.post('/cars', { userId: 'notAllowedUserId' });
        fail('It should fail when using not allowed userId');
    } catch(e) {
        expect(e.response.status).toBe(403);
        expect(e.response.data).toBe('Operation forbidden');
    }
});