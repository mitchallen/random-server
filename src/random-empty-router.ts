
import {default as staticListRouter, StaticListRouterSpec} from './static-list-router';

const DEFAULT_COUNT = 5;

export const emptyRouter = (spec: StaticListRouterSpec = {}) => {

    const {
        count = DEFAULT_COUNT,
        label = 'empty',
        list = []    // should never have records (but can override)
    } = spec;

    const updatedSpec = { ...spec, label, list };

    return staticListRouter(updatedSpec);
};

export default emptyRouter;