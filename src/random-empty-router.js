
staticListRouter = require('./static-list-router');

const DEFAULT_COUNT = 0;

module.exports.create = (spec) => {

    const count = spec.count || DEFAULT_COUNT;

    spec.label = 'empty';  
    spec.list = []; // never has records

    return staticListRouter.create(spec);
};