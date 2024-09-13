"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticListRouter = void 0;
const express_1 = require("express");
const listRouter = (0, express_1.Router)();
const staticListRouter = (spec = {}) => {
    const { appName = 'app', version = '0.0.1', label = 'objects', path = '/api', list = [{ id: 1, title: "TODO" }], port = '' } = spec;
    console.log("vvv --- EXAMPLES --- vvv");
    console.log(`curl http://localhost:${port}/`);
    console.log(`curl http://localhost:${port}${path}`);
    console.log(`curl http://localhost:${port}${path}/${label}`);
    console.log(`curl http://localhost:${port}${path}/${label}/count`);
    console.log(`curl http://localhost:${port}${path}/${label}/1`);
    console.log("^^ --- ^^^^^^^^ --- ^^^");
    listRouter.get('/', (req, res) => {
        res.json({
            status: 'OK',
            app: appName,
            version,
            path
        });
    });
    listRouter.get(`/${label}`, (req, res) => {
        res.json(list);
    });
    listRouter.get(`/${label}/count`, (req, res) => {
        res.json({ count: list.length });
    });
    listRouter.get(`/${label}/:id`, (req, res) => {
        // convert from 1 based to 0 based array
        const id = parseInt(req.params.id, 10) - 1;
        if (id < 0 || id >= list.length) {
            res.status(404).send(`id ${req.params.id} out of range [1 - ${list.length}]`);
        }
        else {
            res.json(list[id]);
        }
    });
    return listRouter;
};
exports.staticListRouter = staticListRouter;
exports.default = exports.staticListRouter;
