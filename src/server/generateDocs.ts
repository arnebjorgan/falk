import { Field, ManualEndpoint, Model } from '../definitions';
const typeMap = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
};

export default (allModels: Model[], manualEndpoints: ManualEndpoint[]) : Object => {
    const models = allModels.filter(model => model.expose);
    return {
        swagger: '2.0',
        tags: models.map(model => model.name).concat(manualEndpoints.length ? ['Manual endpoints'] : []),
        paths: getPaths(models, manualEndpoints),
        definitions: models.reduce((acc: any, model: Model) => {
            acc[model.name] = {
                type: 'object',
                properties: model.fields.reduce((acc: any, field: Field) => {
                    acc[field.name] = {
                        type: typeMap[field.type],
                    };
                    return acc;
                }, {}),
            };
            return acc;
        }, {}),
    };
};

const getPaths = (models: any[], manualEndpoints: ManualEndpoint[]) => {
    let result : any = {};
    models.forEach((model: any) => {
        result[`/${model.name}`] = {
            post: {
                tags: [model.name],
                summary: `Create new ${model.name}.`,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: {
                            $ref: `#/definitions/${model.name}`,
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'OK',
                    },
                    400: {
                        description: 'Bad Request',
                    },
                    500: {
                        description: 'Internal Server Error',
                    },
                },
            },
            get: {
                tags: [model.name],
                summary: `Get many ${model.name}. Filters are possible.`,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [],
                responses: {
                    200: {
                        description: 'OK',
                    },
                    500: {
                        description: 'Internal Server Error',
                    },
                },
            },
        };
        result[`/${model.name}/:id`] = {
            get: {
                tags: [model.name],
                summary: `Get ${model.name} by id.`,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [],
                responses: {
                    200: {
                        description: 'OK',
                    },
                    404: {
                        description: 'Not Found',
                    },
                    500: {
                        description: 'Internal Server Error',
                    },
                },
            },
            put: {
                tags: [model.name],
                summary: `Update ${model.name} by id.`,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: {
                            $ref: `#/definitions/${model.name}`,
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'Success',
                    },
                    400: {
                        description: 'Bad Request',
                    },
                    404: {
                        description: 'Not Found',
                    },
                    500: {
                        description: 'Internal Server Error',
                    },
                },
            },
            patch: {
                tags: [model.name],
                summary: `Partially update ${model.name} by id.`,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: {
                            $ref: `#/definitions/${model.name}`,
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'OK',
                    },
                    400: {
                        description: 'Bad Request',
                    },
                    404: {
                        description: 'Not Found',
                    },
                    500: {
                        description: 'Internal Server Error',
                    },
                },
            },
            delete: {
                tags: [model.name],
                summary: `Delete ${model.name} by id.`,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [],
                responses: {
                    200: {
                        description: 'OK',
                    },
                    404: {
                        description: 'Not Found',
                    },
                    500: {
                        description: 'Internal Server Error',
                    },
                },
            },
        };
    });
    manualEndpoints.forEach(endpoint => {
        if(!result[endpoint.path]) result[endpoint.path] = {};
        result[endpoint.path][endpoint.method] = {
            tags: ['Manual endpoints'],
            summary: `Manual endpoint`,
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [],
            responses: {
                200: {
                    description: 'OK',
                },
                400: {
                    description: 'Bad Request',
                },
                500: {
                    description: 'Internal Server Error',
                },
            },
        };
    });
    return result;
};