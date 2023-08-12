export default (models, customEndpoints) => {
    return {
        swagger: '2.0',
        tags: models.map(model => model.name).concat(customEndpoints.length ? ['Other endpoints'] : []),
        paths: getPaths(models, customEndpoints),
        definitions: models.reduce((acc, model) => {
            acc[model.name] = {
                type: 'object',
                required: Object.keys(model.fields).filter(fieldName => model.fields[fieldName].isRequired),
                properties: Object.entries(model.fields).reduce((acc, current) => {
                    acc[current[0]] = {
                        type: current[1].type.swaggerTypeString,
                        format: current[1].type.swaggerFormatString,
                    };
                    return acc;
                }, {}),
            };
            return acc;
        }, {}),
    };
};

const getPaths = (models, customEndpoints) => {
    let result = {};
    models.forEach((model) => {
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
                    401: {
                        description: 'Unauthorized',
                    },
                    403: {
                        description: 'Forbidden',
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
                    401: {
                        description: 'Unauthorized',
                    },
                    403: {
                        description: 'Forbidden',
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
                    401: {
                        description: 'Unauthorized',
                    },
                    403: {
                        description: 'Forbidden',
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
                    401: {
                        description: 'Unauthorized',
                    },
                    403: {
                        description: 'Forbidden',
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
                    401: {
                        description: 'Unauthorized',
                    },
                    403: {
                        description: 'Forbidden',
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
                    401: {
                        description: 'Unauthorized',
                    },
                    403: {
                        description: 'Forbidden',
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
    customEndpoints.forEach(endpoint => {
        if(!result[endpoint.path]) result[endpoint.path] = {};
        result[endpoint.path][endpoint.httpMethod] = {
            tags: ['Other endpoints'],
            summary: `Other endpoints`,
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