
const chance = new require('chance')();
staticListRouter = require('./static-list-router');

const DEFAULT_COUNT = 5;

module.exports.create = (spec) => {

    const count = spec.count || DEFAULT_COUNT;

    spec.label = 'words';   // usually plural
    spec.list = [];

    for( var i = 0; i < count; i++ ) {
        spec.list.push( { 
            type: spec.label, 
            value: chance.word() 
        });
    }

    return staticListRouter.create(spec);
};