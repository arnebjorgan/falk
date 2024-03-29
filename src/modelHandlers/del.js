export default (model, database, logger) => async (req, res, next) => {
    try {
        const existingData = await database.model(model.name).getById(req.params.id);
        if(!existingData) {
            return res.status(404).send(`Could not find ${model.name} with id ${req.params.id}`);
        }
        const modelRequestContext = {
            auth: res.locals._falk_auth,
            id: req.params.id,
            data: existingData,
            oldData: undefined, 
            operation: {
                read: false,
                get: false,
                list: false,
                write: true,
                create: false,
                update: false,
                delete: true,
            },
            expressRequest: req,
            expressResponse: res,
        };
        const operationIsAllowed = await model.authFunc(modelRequestContext, database);
        if(operationIsAllowed != true) {
            return res.status(403).send('Operation is forbidden');
        }

        const deletedData = await database.model(model.name).delete(req.params.id);
        if(!deletedData) {
            return res.status(404).send(`Could not find ${model.name} with id ${req.params.id}`);
        }

        if(model.onDeleteFunc) {
            try {
                await model.onDeleteFunc(modelRequestContext, database);
            } catch(e) {
                logger.error(`onDelete trigger for model "${model.name}" with id ${req.params.id} failed`, e);
            }
        }

        res.status(200).send(deletedData);
    } catch(e) {
        logger.error(e);
        res.status(500).send('An unexpected error occured');
    }
};