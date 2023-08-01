import post from './post.js';
import put from './put.js';
import patch from './patch.js';
import getMany from './getMany.js';
import getById from './getById.js';
import del from './del.js';
import bodyValidator from './bodyValidator.js';

export default (model, database, logger) => {
    model.bodyValidator = bodyValidator(model);
    return {
        getById: getById(model, database, logger),
        getMany: getMany(model, database, logger),
        post: post(model, database, logger),
        put: put(model, database, logger),
        patch: patch(model, database, logger),
        del: del(model, database, logger),
    };
};