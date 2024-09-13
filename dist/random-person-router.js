"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.personRouter = void 0;
const chance_1 = __importDefault(require("chance"));
const static_list_router_1 = __importDefault(require("./static-list-router"));
const chance = new chance_1.default();
const DEFAULT_COUNT = 5;
const personRouter = (spec = {}) => {
    const { count = DEFAULT_COUNT, label = 'people', list = [] } = spec;
    for (var i = 0; i < count; i++) {
        const gender = chance.gender().toLowerCase();
        const person = {
            type: label,
            prefix: chance.prefix({ gender }),
            first: chance.first({ gender }),
            last: chance.last(),
            age: chance.age(),
            birthday: chance.birthday({ string: true, american: true }),
            gender: gender,
            zip: chance.zip({ plusfour: true }),
            ssnFour: chance.ssn({ ssnFour: true }),
            phone: chance.phone(),
            email: chance.email()
        };
        list.push(person);
    }
    const updatedSpec = Object.assign(Object.assign({}, spec), { label, list });
    return (0, static_list_router_1.default)(updatedSpec);
};
exports.personRouter = personRouter;
exports.default = exports.personRouter;
