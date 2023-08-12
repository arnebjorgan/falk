export default (model, database, logger) => async (req, res, next) => {
    try {
        const existingData = await database.model(model.name).getById(req.params.id);

        const modelRequestContext = {
            auth: res.locals._falk_auth,
            id: req.params.id,
            data: req.body,
            oldData: existingData || undefined, 
            operation: {
                read: false,
                get: false,
                list: false,
                write: true,
                create: !existingData,
                update: !!existingData,
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

        const newData = await database.model(model.name).put(req.params.id, req.body);


        if(!existingData && model.onCreateFunc) {
            try {
                await model.onCreateFunc(modelRequestContext, database);
            } catch(e) {
                logger.error(`onCreate trigger for model "${model.name}" with id ${req.params.id} failed`, e);
            }
        }
        else if(existingData && model.onUpdateFunc) {
            try {
                await model.onUpdateFunc(modelRequestContext, database);
            } catch(e) {
                logger.error(`onUpdate trigger for model "${model.name}" with id ${req.params.id} failed`, e);
            }
        }

        res.status(200).send(newData);
    } catch(e) {
        logger.error(e);
        res.status(500).send('An unexpected error occured');
    }
};