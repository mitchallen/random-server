"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordRouter = void 0;
const chance_1 = __importDefault(require("chance"));
const static_list_router_1 = __importDefault(require("./static-list-router"));
const chance = new chance_1.default();
const DEFAULT_COUNT = 5;
const coordRouter = (spec = {}) => {
    const { count = DEFAULT_COUNT, label = 'coords', list = [] } = spec;
    for (var i = 0; i < count; i++) {
        let coord = chance.coordinates().split(",");
        list.push({
            type: label,
            latitude: parseFloat(coord[0]),
            longitude: parseFloat(coord[1])
        });
    }
    const updatedSpec = Object.assign(Object.assign({}, spec), { label, list });
    return (0, static_list_router_1.default)(updatedSpec);
};
exports.coordRouter = coordRouter;
exports.default = exports.coordRouter;
