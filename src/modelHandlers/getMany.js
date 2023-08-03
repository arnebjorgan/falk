import createGetManyQueryValidator from './getManyQueryValidator.js';
import validFilterOperators from './validFieldOperators.js';

export default (model, database, logger)  => {
    const queryValidator = createGetManyQueryValidator(model);

    return async(req, res, next) => {
        
        try {
            const getManyOptions = {
                filters: [],
                limit: undefined,
                skip: undefined,
                sort: undefined,
            };

            if(req.query._limit != undefined) {
                getManyOptions.limit = parseFloat(req.query._limit);
            }

            if(req.query._skip != undefined) {
                getManyOptions.skip = parseFloat(req.query._skip);
            }

            if(req.query._sort != undefined) {
                const sorterArray = Array.isArray(req.query._sort) ? req.query._sort : [req.query._sort];
                getManyOptions.sort = sorterArray.map(sorter => {
                    if(!sorter.endsWith('|asc') && !sorter.endsWith('|desc')) {
                        sorter += '|asc';
                    }
                    const splitted = sorter.split('|');
                    return {
                        fieldName: splitted[0],
                        direction: splitted[1],
                    };
                });
            }

            let filterObj = { ...req.query };
            delete filterObj._limit;
            delete filterObj._skip;
            delete filterObj._sort;
            for(const queryKey in filterObj) {
                const queryKeyOperator = validFilterOperators.find(operator => queryKey.endsWith('|' + operator));
                const finalOperator = queryKeyOperator || 'eq';
                const fieldName = queryKeyOperator ? queryKey.replace('|' + queryKeyOperator, '') : queryKey;
                const parser = model.fields[fieldName]?.type.parseFromQuery;
                const queryValue = req.query[queryKey];
                const parsedQueryValue = !parser ? queryValue : ['in', 'nin'].includes(finalOperator) ? queryValue.split(',').map(parser) : parser(queryValue);
                getManyOptions.filters.push({
                    fieldName,
                    operator: finalOperator,
                    value: parsedQueryValue,
                });
            }

            const queryErrors = queryValidator(getManyOptions);
        
            if(queryErrors) {
                return res.status(400).send(queryErrors);
            }

            const modelRequestContext = {
                auth: res.locals._falk_auth,
                id: undefined,
                data: undefined,
                oldData: undefined, 
                operation: {
                    read: true,
                    get: false,
                    list: true,
                    write: false,
                    create: false,
                    update: false,
                    delete: false,
                },
                expressRequest: req,
                expressResponse: res,
            };

            //TODO Github issue #51: only exposing equal filters for now, all filters need to be exposed later but it would require a special data structure, decide on structure later    
            modelRequestContext.data = getManyOptions.filters.filter(filter => filter.operator === 'eq').reduce((acc, current) => {
                acc[current.fieldName] = current.value;
                return acc;
            }, {});

            const operationIsAllowed = await model.authFunc(modelRequestContext, database);
            if(operationIsAllowed != true) {
                return res.status(403).send('Operation is forbidden');
            }

            const dbFilter = getManyOptions.filters.reduce((acc, current) => {
                acc[current.fieldName] = database.filter[current.operator](current.value);
                return acc;
            }, {});

            let dbSorters;

            if(getManyOptions.sort) {
                dbSorters = getManyOptions.sort.map(sorter => {
                    if(sorter.direction === 'asc') {
                        return database.sortAsc(sorter.fieldName);
                    }
                    else if(sorter.direction === 'desc') {
                        return database.sortDesc(sorter.fieldName);
                    }
                });
            }

            const result = await database.model(model.name).getMany(dbFilter, {
                sort: dbSorters,
                limit: getManyOptions.limit,
                skip: getManyOptions.skip,
            });

            return res.status(200).send(result);
        } catch(e) {
            logger.error(e);
            res.status(500).send('An unexpected error occured');
        }
    };
};