import Chance from 'chance';
import { default as staticListRouter, StaticListRouterSpec } from './static-list-router';

const chance = new Chance();

const DEFAULT_COUNT = 5;

export const coordRouter = (spec: StaticListRouterSpec = {}) => {

    const {
        count = DEFAULT_COUNT,
        label = 'coords',
        list = []
    } = spec;

    for (var i = 0; i < count; i++) {

        let coord = chance.coordinates().split(",")

        list.push({
            type: label,
            latitude: parseFloat(coord[0]),
            longitude: parseFloat(coord[1])
        });
    }

    const updatedSpec = { ...spec, label, list };

    return staticListRouter(updatedSpec);
};

export default coordRouter;
