/*jslint sloppy: true, white: true, stupid: true, node: true */
/*global SCHEEM, suite, test */

var PEG, fs, rules, parse, evalScheem;
if(typeof module !== 'undefined') {
    PEG = require('pegjs');
    fs = require('fs');
    rules = fs.readFileSync('scheem.peg', 'utf-8');
    parse = PEG.buildParser(rules).parse;
    
    evalScheem = require('./eval').evalScheem;
} else {
    parse = SCHEEM.parse;
}

var evalScheemString = function(scheem_str, env) {
    var tree = parse(scheem_str);
    return evalScheem(tree, env);
};

if(typeof module !== 'undefined') {
    exports.evalScheemString = evalScheemString;
}
