import createGetManyQueryValidator from './getManyQueryValidator.js';
import validFilterOperators from './validFieldOperators.js';

export default (model, database)  => {
    const queryValidator = createGetManyQueryValidator(model);

    return async(req, res, next) => {
        
        const getManyOptions = {
            filters: [],
            limit: undefined,
            skip: undefined,
            sort: undefined,
        };

        if(req.query._limit != undefined) {
            getManyOptions.limit = parseInt(req.query._limit);
        }

        if(req.query._skip != undefined) {
            getManyOptions.skip = parseInt(req.query._skip);
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
            const queryKeyOperator = validFilterOperators.find(operator => queryKey.endsWith(operator));
            const finalOperator = queryKeyOperator || 'eq';
            const fieldName = queryKeyOperator ? queryKey.replace(queryKeyOperator, '') : queryKey;
            const parser = model.fields[fieldName].type.parseFromQuery;
            const value = ['in', 'nin'].includes(finalOperator) ? req.query[queryKey].split(',').map(parser) : parser(value);
            getManyOptions.filters.push({
                fieldName,
                operator: finalOperator,
                value,
            });
        }

        const queryErrors = queryValidator(getManyOptions);
    
        if(queryErrors) {
            return res.status(400).send(queryErrors);
        }

        const modelRequestContext = {
            auth: res.locals._falk_auth,
            id: undefined,
            data: 'TODO',
            oldData: 'TODO', 
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

        /* TODO POPULATE OLD DATA
        //TODO Github issue #51: only exposing equal filters for now, all filters need to be exposed later but it would require a special data structure, decide on structure later    
        result.oldData = {
            data: getManyOptions.filters.filter(filter => filter.operator === DatabaseFilterOperator.EQUAL).reduce((acc: { [key: string]: any }, current) => {
                acc[current.key] = current.value;
                return acc;
            }, {}),
        };
        result.getManyFilters = getManyOptions.filters;
        result.getManySorters = getManyOptions.sorters;
        result.getManyLimit = getManyOptions.limit;
        result.getManySkip = getManyOptions.skip;*/

        const operationIsAllowed = await model.authFunc(modelRequestContext, database);
        if(operationIsAllowed != true) {
            return res.status(403).send('Operation is forbidden');
        }

        const dbFilter = getManyOptions.filters.reduce((acc, current) => {
            acc[current.fieldName] = database.filter[current.operator](current.value);
            return acc;
        }, {});

        let dbSort;

        if(getManyOptions.sort) {
            dbSort = getManyOptions.sort.map(sorter => {
                if(sorter.direction === 'asc') {
                    return database.sortAsc(sorter.fieldName);
                }
                else if(sorter.direction === 'desc') {
                    return database.sortDesc(sorter.fieldName);
                }
            });
        }

        const result = await database.model(model.name).getMany(dbFilter, {
            sorters: dbSort,
            limit: getManyOptions.limit,
            skip: getManyOptions.skip,
        });

        return res.status(200).send(result);
    };
};