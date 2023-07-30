import post from './post.js';
import put from './put.js';
import patch from './patch.js';
import getMany from './getMany.js';
import getById from './getById.js';
import del from './del.js';
import bodyValidator from './bodyValidator.js';

export default (model, database) => {
    model.bodyValidator = bodyValidator(model);
    return {
        getById: getById(model, database),
        getMany: getMany(model, database),
        post: post(model, database),
        put: put(model, database),
        patch: patch(model, database),
        del: del(model, database),
    };
};