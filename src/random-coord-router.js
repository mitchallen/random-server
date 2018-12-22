
const chance = new require('chance')();
staticListRouter = require('./static-list-router');

const DEFAULT_COUNT = 5;

module.exports.create = (spec) => {

    const count = spec.count || DEFAULT_COUNT;

    spec.label = 'coords';   // usually plural
    spec.list = [];

    for( var i = 0; i < count; i++ ) {

        let coord = chance.coordinates().split(",")

        spec.list.push( { 
            type: spec.label, 
            latitude: parseFloat(coord[0]),
            longitude: parseFloat(coord[1]) 
        });
    }

    return staticListRouter.create(spec);
};