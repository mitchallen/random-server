import Chance from 'chance';
import {default as staticListRouter, StaticListRouterSpec} from '../static-list-router';

const chance = new Chance();

const DEFAULT_COUNT = 5;

export const wordRouter = (spec: StaticListRouterSpec = {}) => {
    const {
        count = DEFAULT_COUNT,
        label = 'words',
        list = []
    } = spec;


    for (let i = 0; i < count; i++) {
        list.push({
            type: label,
            value: chance.word(),
        });
    }

    const updatedSpec = { ...spec, label, list };

    return staticListRouter(updatedSpec);
};

export default wordRouter;

