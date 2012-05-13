var PEG = require('pegjs');
var fs = require('fs');
var rules = fs.readFileSync('scheem.peg', 'utf-8');
var parse = PEG.buildParser(rules).parse;
var evalScheem = require('./eval').evalScheem;
var make_env = require('./eval').make_env;
var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var program;
var env, tree, result;

var JUST_PARSE = false;


if(process.argv.length != 3) {
    console.error("Usage: %s %s <program>", process.argv[0], process.argv[1]);
    process.exit(-1);
}

try {
    program = fs.readFileSync(process.argv[2], 'utf-8');
    
    env = make_env();
    tree = parse(program);
    if(JUST_PARSE) {
        console.log(tree);
    } else {
        result = evalScheem(tree, env);
        if(typeof result !== 'undefined') {
            console.log(result);
        }
    }
} catch(err) {
    console.error("ERROR:", err.message);
    if(_.has(err, 'expr')) {
        console.error("EXPRESSION: ", err.expr);
    }
}
