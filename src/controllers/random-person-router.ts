import Chance from 'chance';
import {default as staticListRouter, StaticListRouterSpec} from '../static-list-router';

const chance = new Chance();

const DEFAULT_COUNT = 5;

export const personRouter = (spec: StaticListRouterSpec = {}) => {

    const {
        count = DEFAULT_COUNT,
        label = 'people',
        list = []
    } = spec;

    for( var i = 0; i < count; i++ ) {

        const gender = chance.gender().toLowerCase() as 'male' | 'female';

        const person = {
            type: label,
            prefix: chance.prefix({gender}),
            first: chance.first({gender}),
            last: chance.last(),
            age: chance.age(),
            birthday: chance.birthday({string: true, american: true}),
            gender: gender,
            zip: chance.zip({plusfour: true}),
            ssnFour: chance.ssn({ ssnFour: true }),
            phone: chance.phone(),
            email: chance.email()
        }

        list.push( person );
    }

    const updatedSpec = { ...spec, label, list };

    return staticListRouter(updatedSpec);
};

export default personRouter;