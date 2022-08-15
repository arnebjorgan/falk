import { Request, Response, NextFunction, RequestHandler } from 'express';
import fieldTypes from '../fieldTypes';
import { Database, DatabaseFilter, DatabaseFilterOperator, DatabaseGetManyOptions, DatabaseSortDirection, DatabaseSorter, Model } from '../definitions';
import createGetManyQueryValidator from './createGetManyQueryValidator';
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

export default (model: Model, database: Database) : RequestHandler  => {
    const queryValidator = createGetManyQueryValidator(model);
    return async (req: Request, res: Response, next: NextFunction) => {

        const parseFilterValue = (key: string, value : any, operator: DatabaseFilterOperator) : any => {
            const isArrayOperator = [DatabaseFilterOperator.IN, DatabaseFilterOperator.NOTIN].includes(operator);
            const field = model.fields.find(field => field.name === key);
            if(field) {
                const parser = fieldTypes[field.type].parseFromQuery;
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
                filters.push({
                    key,
                    value: parsedValue,
                    operator: finalOperator,
                });
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
                sorters.push({
                    fieldName,
                    sortDirection: foundSortDirection ? foundSortDirection.direction : DatabaseSortDirection.ASC,
                });
            });
        }

        const _limit = req.query._limit ? parseFloat(req.query._limit as string) : undefined;
        const _skip = req.query._skip ? parseFloat(req.query._skip as string) : undefined;

        const getManyOptions : DatabaseGetManyOptions = {
            filters,
            sorters,
            _limit,
            _skip,
        };
        const queryErrors = queryValidator(getManyOptions);
        
        if(queryErrors) {
            res.status(400).send(queryErrors);
        }
        else {
            const result = await database.getMany(model.name, getManyOptions);
            res.send(result);
        }
    };
};