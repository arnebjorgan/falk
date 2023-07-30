export default (authFunc, database) => async (req, res, next) => {
    try {
        await authFunc(
            (authObj) => {
                res.locals._falk_auth = authObj;
                next();
            },
            () => {
                res.status(401).send('User is not authorized');
            },
            req,
            database,
        );
    } catch(e) {
        res.status(500).send('An unexpected error occured');
    }
};