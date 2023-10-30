'use strict';

const [Script, parser] = [require('./lib/script'), require('./lib/parser')];

module.exports = Script;
module.exports.from = parser;
