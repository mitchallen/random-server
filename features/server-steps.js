const assert = require('assert');
const axios = require('axios');
const { setWorldConstructor, Given, When, Then, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3100;  // default port used by server
const TEST_PORT = process.env.TEST_PORT || PORT;

let serverProcess;

BeforeAll(async function () {
    // Start the server
    serverProcess = spawn('npm', ['start'], { stdio: 'inherit' });

    // Wait for the server to start (you might need to adjust the delay)
    await new Promise(resolve => setTimeout(resolve, 5000));
});

AfterAll(function () {
    // Shut down the server
    if (serverProcess) {
        serverProcess.kill();
    }
});

setWorldConstructor(function (options) {
    function createWorld() {
        const serviceUrl = `http://localhost:${TEST_PORT}`
        const headers = {
            'accept': 'application/json',
            'x-api-key': 'demo-key'
        }
        let root = {}
        return {
            serviceUrl,
            headers,
            root,
        }
    }
    this.world = createWorld();
})

Given('the server is running', function () {
    // The server should already be running due to the BeforeAll hook
});

When('the root endpoint is requested', async function () {
    this.world.root.response = await axios.get(this.world.serviceUrl);
})

Then('the response should contain a version property', async function () {
    const response = this.world.root.response;
    assert.ok(response.data.version)
})

When('the {string} endpoint is requested', async function (endpoint) {
    this.response = await axios.get(`http://localhost:3100${endpoint}`);
});

Then('the response should be a JSON array', function () {
    assert(Array.isArray(this.response.data), 'Response is not an array');
});

Then('the response should be an empty JSON array', function () {
    assert(Array.isArray(this.response.data), 'Response is not an array');
    assert((this.response.data.length === 0), 'Response is not an empty array');
});

Then('the response should be a JSON array with at least one item', function () {
    assert(Array.isArray(this.response.data), 'Response is not an array');
    assert((this.response.data.length > 0), 'Response array should have at least one item');
});

Then('each item in the array should have {string} and {string} properties', function (prop1, prop2) {
    this.response.data.forEach(item => {
        assert(item.hasOwnProperty(prop1), `Item is missing ${prop1} property`);
        assert(item.hasOwnProperty(prop2), `Item is missing ${prop2} property`);
    });
});

Then('the {string} property of each item should be {string}', function (prop, value) {
    this.response.data.forEach(item => {
        assert.strictEqual(item[prop], value, `${prop} property is not ${value}`);
    });
});

Then('the {string} property of each item should be a non-empty string', function (prop) {
    this.response.data.forEach(item => {
        assert(typeof item[prop] === 'string', `${prop} property is not a string`);
        assert(item[prop].length > 0, `${prop} property is an empty string`);
    });
});

Then('the {string} property of each item should be a number between {int} and {int}', function (prop, min, max) {
    this.response.data.forEach(item => {
        assert(typeof item[prop] === 'number', `${prop} property is not a number`);
        assert(item[prop] >= min && item[prop] <= max, `${prop} is not between ${min} and ${max}`);
    });
});

Then('the {string} property of each item should be a numeric value', function (prop) {
    this.response.data.forEach(item => {
        assert(typeof item[prop] === 'number', `${prop} property is not a number`);
    });
});
