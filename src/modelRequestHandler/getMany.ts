import { Request, Response, NextFunction } from 'express';
import { Database, DatabaseFilter, DatabaseFilterOperator, DatabaseGetManyOptions, DatabaseSortDirection, DatabaseSorter, Model, ModelHandler, PrepareHandleResult } from '../definitions';
import createGetManyQueryValidator from './getManyQueryValidator';
const queryFilterOperatorMap = [
    {  key: '|like', operator: DatabaseFilterOperator.LIKE, },
    {  key: '|ne', operator: DatabaseFilterOperator.NOTEQUAL, },
    {  key: '|gt', operator: DatabaseFilterOperator.GREATER, },
    {  key: '|gte', operator: DatabaseFilterOperator.GREATEROREQUAL, },
    {  key: '|lt', operator: DatabaseFilterOperator.LESS, },
    {  key: '|lte', operator: DatabaseFilterOperator.LESSOREQUAL, },
    {  key: '|in', operator: DatabaseFilterOperator.IN, },
    {  key: '|nin', operator: DatabaseFilterOperator.NOTIN, },
];
const querySorterDirectionMap = [
    { key: '|asc', direction: DatabaseSortDirection.ASC, },
    { key: '|desc', direction: DatabaseSortDirection.DESC, },    
];
const specialQueryKeys = ['_sort', '_limit', '_skip'];

export default (model: Model, database: Database) : ModelHandler  => {

    const getGetManyOptions = (req: Request) => {
        const parseFilterValue = (key: string, value : any, operator: DatabaseFilterOperator) : any => {
            const isArrayOperator = [DatabaseFilterOperator.IN, DatabaseFilterOperator.NOTIN].includes(operator);
            if(model.fields[key]) {
                const parser = model.fields[key].fieldType.parseFromQuery;
                return isArrayOperator ? value.split(',').map(parser) : parser(value);
            }
            return null;
        };

        // Filters
        const filters : DatabaseFilter[] = [];
        for(const queryKey in req.query) {
            if(specialQueryKeys.includes(queryKey)) {
                continue;
            }
            else {
                const foundOperator = queryFilterOperatorMap.find(operator => queryKey.endsWith(operator.key));
                const finalOperator = foundOperator ? foundOperator.operator : DatabaseFilterOperator.EQUAL;
                const key = foundOperator ? queryKey.replace(foundOperator.key, '') : queryKey;
                const parsedValue = parseFilterValue(key, req.query[queryKey], finalOperator);
                filters.push(database.filter.createFilter(key, finalOperator, parsedValue));
            }
        }

        // Sorters
        const sorters : DatabaseSorter[] = [];
        if(req.query._sort) {
            // @ts-ignore
            let sorterValues : string[] = typeof req.query._sort === 'string' ? [req.query._sort] : req.query._sort;
            sorterValues.forEach((sorterValue: string) => {
                const foundSortDirection = querySorterDirectionMap.find(direction => sorterValue.endsWith(direction.key));
                const fieldName = foundSortDirection ? sorterValue.replace(foundSortDirection.key, '') : sorterValue;
                sorters.push(database.sort(fieldName, foundSortDirection?.direction));
            });
        }

        const limit = req.query._limit ? parseFloat(req.query._limit as string) : undefined;
        const skip = req.query._skip ? parseFloat(req.query._skip as string) : undefined;

        return {
            filters,
            sorters,
            limit,
            skip,
        };
    }

    const queryValidator = createGetManyQueryValidator(model);
    return {
        prepareHandle: async(req: Request) => {
            const result = {
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
            } as PrepareHandleResult;

            const getManyOptions = getGetManyOptions(req);

            const queryErrors = queryValidator({
                filters: getManyOptions.filters,
                sorters: getManyOptions.sorters,
                _limit: getManyOptions.limit,
                _skip: getManyOptions.skip,
            });
            
            if(queryErrors) {
                result.errorStatus = 400;
                result.error = queryErrors;
            }
            else {
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
                result.getManySkip = getManyOptions.skip;
            }

            return result;
        },
        handle: async (req: Request, res: Response, next: NextFunction, prepareHandleResult?: PrepareHandleResult) => {
            let getManyOptions = {} as {
                filters: DatabaseFilter[],
                sorters: DatabaseSorter[],
                limit?: number,
                skip?: number,
            };
            if(prepareHandleResult) {
                getManyOptions.filters = prepareHandleResult.getManyFilters;
                getManyOptions.sorters = prepareHandleResult.getManySorters;
                getManyOptions.limit = prepareHandleResult.getManyLimit;
                getManyOptions.skip = prepareHandleResult.getManySkip;
            }
            else {
                getManyOptions = getGetManyOptions(req);
            }
            if(!prepareHandleResult) {
                const queryErrors = queryValidator({
                    filters: getManyOptions.filters,
                    sorters: getManyOptions.sorters,
                    _limit: getManyOptions.limit,
                    _skip: getManyOptions.skip,
                });
                
                if(queryErrors) {
                    res.status(400).send(queryErrors);
                    return;
                }
            }
            const result = await database.collection(model.name).getMany(getManyOptions.filters, {
                sorters: getManyOptions.sorters,
                limit: getManyOptions.limit,
                skip: getManyOptions.skip,
            });
            res.send(result);
        },
    };
};