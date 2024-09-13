"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordRouter = void 0;
const chance_1 = __importDefault(require("chance"));
const static_list_router_1 = __importDefault(require("./static-list-router"));
const chance = new chance_1.default();
const DEFAULT_COUNT = 5;
const wordRouter = (spec = {}) => {
    const { count = DEFAULT_COUNT, label = 'words', list = [] } = spec;
    for (let i = 0; i < count; i++) {
        list.push({
            type: label,
            value: chance.word(),
        });
    }
    const updatedSpec = Object.assign(Object.assign({}, spec), { label, list });
    return (0, static_list_router_1.default)(updatedSpec);
};
exports.wordRouter = wordRouter;
exports.default = exports.wordRouter;
