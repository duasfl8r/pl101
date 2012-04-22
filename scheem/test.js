var assert = require('assert');
var scheem = require('./scheem.js');

tests = [
    {
        expr: '(* n (factorial (- n 1)))',
        result: ["*", "n", ["factorial", ["-", "n", "1"]]]
    },

    {
        expr: '(+ 1 (* x 3))',
        result: ["+", "1", ["*", "x", "3"]]
    }
];

tests.forEach(function(test) {
    process.stdout.write("Testing: " + test.expr + "... ", 'utf-8');
    try {
        assert.deepEqual(scheem.parse(test.expr), test.result);
        console.log("success!");
    } catch(err) {
        console.log("ERROR:");
        console.log(err);
        process.exit(-1);
    }
});
