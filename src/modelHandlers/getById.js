export default (model, database, logger) => async (req, res, next) => {
    try {
        const existingData = await database.model(model.name).getById(req.params.id);
        if(!existingData) {
            return res.status(404).send(`Could not find document with id ${req.params.id}`);
        }
        const modelRequestContext = {
            auth: res.locals._falk_auth,
            id: req.params.id,
            data: existingData,
            oldData: undefined, 
            operation: {
                read: true,
                get: true,
                list: false,
                write: false,
                create: false,
                update: false,
                delete: false,
            },
            expressRequest: req,
            expressResponse: res,
        };
        const operationIsAllowed = await model.authFunc(modelRequestContext, database);
        if(operationIsAllowed != true) {
            return res.status(403).send('Operation is forbidden');
        }

        const data = await database.model(model.name).getById(req.params.id);
        if(!data) {
            return res.status(404).send(`Could not find document with id ${req.params.id}`);
        }
        res.status(200).send(data);
    } catch(e) {
        logger.error(e);
        res.status(500).send('An unexpected error occured');
    }
};