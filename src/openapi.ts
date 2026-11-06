// The OpenAPI spec served at /api-docs. It is a typed object rather than
// YAML parsed at boot, so the server needs no YAML parser or spec-merging
// library at runtime (swagger-jsdoc pulled in 27 packages and most of this
// repo's Dependabot alerts), and a malformed spec fails `tsc` instead of
// rendering wrong. Add new routes to `paths` and new shapes to `schemas`.
import type { OpenAPIV3 } from 'openapi-types';

export interface OpenApiInfo {
    basePath: string;
    title: string;
    version: string;
    description: string;
}

// A security scheme rather than a header parameter: tool generators turn a
// parameter into a tool input, which would show the key to the caller's model.
const apiKeyScheme: OpenAPIV3.ApiKeySecurityScheme = {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
    description: 'Required only when the server is started with API_KEY set',
};

const requiresApiKey: OpenAPIV3.SecurityRequirementObject[] = [{ apiKey: [] }];

const objectIdParam: OpenAPIV3.ParameterObject = {
    in: 'path',
    name: 'objectId',
    schema: { type: 'integer', minimum: 1 },
    required: true,
    description: 'Position in the collection, starting at 1',
};

const errorResponses: OpenAPIV3.ResponsesObject = {
    '400': { description: 'Bad Request' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '404': { description: 'Not found' },
    '498': { description: 'Token expired' },
    '500': { description: 'Internal server error' },
};

const json = (
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    example: unknown,
): OpenAPIV3.ResponseObject['content'] => ({
    'application/json': { schema, example },
});

const ref = (name: string): OpenAPIV3.ReferenceObject => ({
    $ref: `#/components/schemas/${name}`,
});

// The list, count and by-id routes every random collection exposes.
const collectionPaths = (
    route: string,
    tag: string,
    schemaName: string,
    noun: { one: string; many: string; its: string },
    ids: { list: string; count: string; get: string },
    example: object,
): OpenAPIV3.PathsObject => ({
    [`/v1/${route}`]: {
        get: {
            operationId: ids.list,
            security: requiresApiKey,
            summary: `Get an array of ${noun.many}`,
            tags: [tag],
            responses: {
                '200': {
                    description: `An array of random ${noun.many}.`,
                    content: json({ type: 'array', items: ref(schemaName) }, [example]),
                },
                ...errorResponses,
            },
        },
    },
    [`/v1/${route}/count`]: {
        get: {
            operationId: ids.count,
            security: requiresApiKey,
            summary: `Get the count of ${noun.many}`,
            tags: [tag],
            responses: {
                '200': {
                    description: `The number of ${noun.many}.`,
                    content: json(
                        { type: 'object', properties: { count: { type: 'integer' } } },
                        { count: 100 },
                    ),
                },
                ...errorResponses,
            },
        },
    },
    [`/v1/${route}/{objectId}`]: {
        get: {
            operationId: ids.get,
            security: requiresApiKey,
            summary: `Get a ${noun.one} by ${noun.its} objectId`,
            parameters: [objectIdParam],
            tags: [tag],
            responses: {
                '200': {
                    description: `The ${noun.one} at the nth position.`,
                    content: json(ref(schemaName), example),
                },
                ...errorResponses,
            },
        },
    },
});

const coordExample = {
    type: 'coords',
    latitude: 41.726931,
    longitude: -49.948253,
};

const wordExample = { type: 'words', value: 'zemic' };

const valueExample = { type: 'values', name: 'dafe', value: -415365907192.2176 };

const personExample = {
    type: 'people',
    prefix: 'Dr.',
    first: 'Rena',
    last: 'Dunn',
    age: 27,
    birthday: '8/30/1976',
    gender: 'female',
    zip: '73719-5785',
    ssnFour: '4353',
    phone: '(508) 555-5676',
    email: 'isdal@vouz.mt',
};

const schemas: Record<string, OpenAPIV3.SchemaObject> = {
    Word: {
        type: 'object',
        required: ['type', 'value'],
        properties: {
            type: { type: 'string', description: 'The type defaults to words' },
            value: { type: 'string', description: 'A random word' },
        },
        example: wordExample,
    },
    Value: {
        type: 'object',
        required: ['type', 'name', 'value'],
        properties: {
            type: { type: 'string', description: 'The type defaults to values' },
            name: { type: 'string', description: 'A random name' },
            value: { type: 'number', description: 'A random number' },
        },
        example: valueExample,
    },
    Empty: {
        type: 'object',
        description: 'The empty collection has no records, so this is never returned',
    },
    Coord: {
        type: 'object',
        required: ['type', 'latitude', 'longitude'],
        properties: {
            type: { type: 'string', description: 'The type defaults to coords' },
            latitude: { type: 'number', description: 'The latitude coordinate' },
            longitude: { type: 'number', description: 'The longitude coordinate' },
        },
        example: coordExample,
    },
    Person: {
        type: 'object',
        required: [
            'type', 'prefix', 'first', 'last', 'age', 'birthday',
            'gender', 'zip', 'ssnFour', 'phone', 'email',
        ],
        properties: {
            type: { type: 'string', description: 'Type defaults to people' },
            prefix: { type: 'string', description: 'Name prefix (Dr., etc.)' },
            first: { type: 'string', description: 'First name' },
            last: { type: 'string', description: 'Last name' },
            age: { type: 'number', description: 'Age' },
            birthday: { type: 'string', description: 'Birthday in MM/DD/YYYY format' },
            gender: { type: 'string', description: 'Gender' },
            zip: { type: 'string', description: 'Zip code i zip+4 format' },
            ssnFour: { type: 'string', description: 'The last four digits of the SSN' },
            phone: { type: 'string', description: 'Phone number in US format (xxx) xxx-xxxx' },
            email: { type: 'string', description: 'Email address' },
        },
        example: personExample,
    },
};

export const buildOpenApiSpec = (info: OpenApiInfo): OpenAPIV3.Document => ({
    openapi: '3.0.0',
    servers: [
        {
            url: info.basePath, // e.g. "/api/service1"
            description: 'Mounted base path',
        },
    ],
    info: {
        title: info.title,
        version: info.version,
        description: info.description,
    },
    paths: {
        '/': {
            get: {
                operationId: 'getStatus',
                summary: 'Get the service status',
                tags: ['service health'],
                responses: {
                    '200': {
                        description: 'Service status',
                        content: json({ type: 'object' }, {
                            status: 'OK',
                            app: 'app name',
                            version: '1.0.0',
                            explorer: '/api-docs',
                            uptime: '00:00:31',
                            route: '/',
                        }),
                    },
                    '500': { description: 'Internal service error' },
                },
            },
        },
        ...collectionPaths('coords', 'coords', 'Coord',
            { one: 'coord', many: 'coords', its: 'its' },
            { list: 'listCoords', count: 'countCoords', get: 'getCoord' }, coordExample),
        ...collectionPaths('people', 'people', 'Person',
            { one: 'person', many: 'people', its: 'their' },
            { list: 'listPeople', count: 'countPeople', get: 'getPerson' }, personExample),
        ...collectionPaths('words', 'words', 'Word',
            { one: 'word', many: 'words', its: 'its' },
            { list: 'listWords', count: 'countWords', get: 'getWord' }, wordExample),
        ...collectionPaths('values', 'values', 'Value',
            { one: 'value', many: 'values', its: 'its' },
            { list: 'listValues', count: 'countValues', get: 'getValue' }, valueExample),
        ...collectionPaths('empty', 'empty', 'Empty',
            { one: 'record', many: 'records in the always-empty collection', its: 'its' },
            { list: 'listEmpty', count: 'countEmpty', get: 'getEmpty' }, {}),
    },
    components: { schemas, securitySchemes: { apiKey: apiKeyScheme } },
});
