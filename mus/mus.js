var PEG = require('pegjs');
var fs = require('fs');

rules = fs.readFileSync('mus.peg', 'utf-8');

var parse = PEG.buildParser(rules).parse;

exports.parse = parse;
