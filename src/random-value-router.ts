
import Chance from 'chance';
import {default as staticListRouter, StaticListRouterSpec} from './static-list-router';

const chance = new Chance();

const DEFAULT_COUNT = 5;

export const valueRouter = (spec: StaticListRouterSpec = {}) => {

    const {
        count = DEFAULT_COUNT,
        label = 'values',
        list = []
    } = spec;

    for( var i = 0; i < count; i++ ) {
        list.push( { 
            type: label, 
            name: chance.word(), 
            value: chance.floating() 
        });
    }

    const updatedSpec = { ...spec, label, list };

    return staticListRouter(updatedSpec);
};

export default valueRouter;
