
const chance = new require('chance')();
staticListRouter = require('./static-list-router');

const DEFAULT_COUNT = 5;

module.exports.create = (spec) => {

    const count = spec.count || DEFAULT_COUNT;

    spec.label = 'values';   // usually plural
    spec.list = [];

    for( var i = 0; i < count; i++ ) {
        spec.list.push( { 
            type: spec.label, 
            name: chance.word(), 
            value: chance.floating() 
        });
    }

    return staticListRouter.create(spec);
};