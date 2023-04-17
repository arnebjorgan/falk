const axios = require('axios');

const server = axios.create({
    baseURL: 'http://localhost:8080',
});

beforeAll(async () => {
    const foosResponse = await server.get('/foos');
    await Promise.all(foosResponse.data.map(foo => server.delete(`/foos/${foo._id}`)));
    const triggerLogsResponse = await server.get('/trigger-logs');
    await Promise.all(triggerLogsResponse.data.map(log => server.delete(`/trigger-logs/${log._id}`)));
});

test('model.onCreateTrigger - post', async () => {
    const createResponse = await server.post('/foos');
    const triggerLogResponse = await server.get(`/trigger-logs?fooId=${createResponse.data._id}&triggerType=create`);
    expect(triggerLogResponse.status).toBe(200);
    expect(triggerLogResponse.data.length).toBe(1);
});

test('model.onCreateTrigger - put', async () => {
    const putResponse = await server.put(`/foos/643dafe39dd2cfc9f006b064`);
    const triggerLogResponse = await server.get(`/trigger-logs?fooId=${putResponse.data._id}&triggerType=create`);
    expect(triggerLogResponse.status).toBe(200);
    expect(triggerLogResponse.data.length).toBe(1);
});

test('model.onUpdateTrigger - put', async () => {
    const createResponse = await server.post('/foos');
    await server.put(`/foos/${createResponse.data._id}`);
    const triggerLogResponse = await server.get(`/trigger-logs?fooId=${createResponse.data._id}&triggerType=update`);
    expect(triggerLogResponse.status).toBe(200);
    expect(triggerLogResponse.data.length).toBe(1);
});

test('model.onUpdateTrigger - patch', async () => {
    const createResponse = await server.post('/foos');
    await server.patch(`/foos/${createResponse.data._id}`);
    const triggerLogResponse = await server.get(`/trigger-logs?fooId=${createResponse.data._id}&triggerType=update`);
    expect(triggerLogResponse.status).toBe(200);
    expect(triggerLogResponse.data.length).toBe(1);
});

test('model.onDeleteTrigger - delete', async () => {
    const createResponse = await server.post('/foos');
    await server.delete(`/foos/${createResponse.data._id}`);
    const triggerLogResponse = await server.get(`/trigger-logs?fooId=${createResponse.data._id}&triggerType=delete`);
    expect(triggerLogResponse.status).toBe(200);
    expect(triggerLogResponse.data.length).toBe(1);
});