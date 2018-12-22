
const chance = new require('chance')();
staticListRouter = require('./static-list-router');

const DEFAULT_COUNT = 5;

module.exports.create = (spec) => {

    const count = spec.count || DEFAULT_COUNT;

    spec.label = 'people';   // usually plural
    spec.list = [];

    for( var i = 0; i < count; i++ ) {

        const person = {
            type: spec.label,
            prefix: chance.prefix(),
            first: chance.first(),
            last: chance.last(),
            age: chance.age(),
            birthday: chance.birthday({string: true, american: true}),
            gender: chance.gender(),
            zip: chance.zip({plusfour: true}),
            ssnFour: chance.ssn({ ssnFour: true }),
            phone: chance.phone(),
            email: chance.email()
        }

        spec.list.push( person );
    }

    return staticListRouter.create(spec);
};