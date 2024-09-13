"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyRouter = void 0;
const static_list_router_1 = __importDefault(require("./static-list-router"));
const DEFAULT_COUNT = 5;
const emptyRouter = (spec = {}) => {
    const { count = DEFAULT_COUNT, label = 'empty', list = [] // should never have records (but can override)
     } = spec;
    const updatedSpec = Object.assign(Object.assign({}, spec), { label, list });
    return (0, static_list_router_1.default)(updatedSpec);
};
exports.emptyRouter = emptyRouter;
exports.default = exports.emptyRouter;
