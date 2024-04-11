const EventEmitter = require('events');

class CustomEmitter extends EventEmitter {}

const myEmitter = new CustomEmitter();
myEmitter.setMaxListeners(20);

module.exports = myEmitter;