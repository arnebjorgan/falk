const falk = require('../dist/index');
const app = falk.createApp();

app.model('trigger-logs', {
    fooId: falk.field.string(),
    triggerType: falk.field.string(),
}).expose((context, db) => {
    return true;
});

app.model('foos', {}).expose((context, db) => {
    return true;
}).onCreate(async (context, db) => {
    await db.collection('trigger-logs').create({
        fooId: context.id,
        triggerType: 'create',
    });
}).onUpdate(async (context, db) => {
    await db.collection('trigger-logs').create({
        fooId: context.id,
        triggerType: 'update',
    });
}).onDelete(async (context, db) => {
    await db.collection('trigger-logs').create({
        fooId: context.id,
        triggerType: 'delete',
    });
});

app.start();