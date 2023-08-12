export default (handler, database) => async(req, res, next) => {
    await handler(req, res, next, database);
};