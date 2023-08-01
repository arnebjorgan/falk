export default (model, database, logger) => async (req, res, next) => {
    try {
        const modelRequestContext = {
            auth: res.locals._falk_auth,
            id: req.params.id,
            data: req.body,
            oldData: undefined, 
            operation: {
                read: false,
                get: false,
                list: false,
                write: true,
                create: true,
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

        const errors = model.bodyValidator(req.body);
        if(errors) {
            return res.status(400).send(errors);
        }

        const newData = await database.model(model.name).create(req.body);

        if(model.onCreateFunc) {
            try {
                await model.onCreateFunc(modelRequestContext, database);
            } catch(e) {
                logger.error(`onCreate trigger for model "${model.name}" with id ${request.params.id} failed`, e);
            }
        }

        res.status(200).send(newData);
    } catch(e) {
        logger.error(e);
        res.status(500).send('An unexpected error occured');
    }
};