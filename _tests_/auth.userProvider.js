const falk = require('../dist/index');
const app = falk.default();

app.authentication.userProvider((req, acceptUser, rejectUser) => {
    if(req.body.userId) {
        acceptUser({
            userId: req.body.userId,
        });
    }
    else {
        rejectUser();
    }
});

app.model('cars', {
    userId: falk.fieldType.string(),
}, {
    expose: true,
    allow: (data, operation, user) => {
        return !!user?.userId;
    },
});

app.startServer();