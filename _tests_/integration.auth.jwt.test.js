const axios = require('axios');

const server = axios.create({
    baseURL: 'http://localhost:8080',
});

test('missing header - it should return 401', async () => {
    try {
        const response = await server.get('/');
        fail('It should fail when sending request without Authorization header');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe(`Request header 'Authorization' for JWT Bearer authentication is missing`);
    }
});

test('wrong authorization header format - it should return 401', async () => {
    try {
        const response = await server.get('/', { headers: { Authorization: 'notbearer foobar' } });
        fail('It should fail when sending request with wrong authorization header format key');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe(`Request header 'Authorization' for JWT Bearer authentication is not on the format 'Bearer {TOKEN}'`);
    }
});

test('invalid token - it should return 401', async () => {
    try {
        const response = await server.get('/', { headers: { Authorization: 'Bearer foobar' } });
        fail('It should fail when sending request with invalid token');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe(`Invalid JWT`);
    }
});

test('login should fail when sending wrong username - it should return 401', async () => {
    try {
        const response = await server.post('/auth/login', { username: 'foobar' });
        fail('It should fail when logging in with wrong username');
    } catch(e) {
        expect(e.response.status).toBe(401);
        expect(e.response.data).toBe(`Authentication failed`);
    }
});

let token;

test('login should succeed when sending correct username - it should return 200', async () => {
    const response = await server.post('/auth/login', { username: 'foo' });
    expect(response.status).toBe(200);
    expect(response.data.token).not.toBeUndefined();
    expect(response.data.token).not.toBeNull();
    expect(response.data.userData).not.toBeNull();
    expect(response.data.userData).not.toBeUndefined();
    expect(response.data.userData.username).toBe('foo');
    token = response.data.token;
});

test('valid token - it should return 200', async () => {
    const response = await server.get('/', { headers: { Authorization: `Bearer ${token}` } });
    expect(response.status).toBe(200);
    expect(response.data).not.toBeUndefined();
    expect(response.data).not.toBeNull();
});