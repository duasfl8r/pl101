/*jslint sloppy: true, white: true, stupid: true, node: true */
/*global SCHEEM, suite, test */

var PEG, fs, rules, parse, evalScheem, make_env;
if(typeof module !== 'undefined') {
    PEG = require('pegjs');
    fs = require('fs');
    rules = fs.readFileSync('scheem.peg', 'utf-8');
    parse = PEG.buildParser(rules).parse;
    
    evalScheem = require('./eval').evalScheem;
    make_env = require('./eval').make_env;
} else {
    parse = SCHEEM.parse;
}

var evalScheemString = function(scheem_str, env) {
    env = (typeof env === 'undefined') ? make_env() : env;

    var tree = parse(scheem_str);
    return evalScheem(tree, env);
};

if(typeof module !== 'undefined') {
    exports.evalScheemString = evalScheemString;
}
