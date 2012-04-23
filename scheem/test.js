var assert = require('assert');
var scheem = require('./scheem.js');

var factorial_scheem = '(* n (factorial (- n 1)))';
var factorial_result = ["*", "n", ["factorial", ["-", "n", "1"]]];
assert.deepEqual(scheem.parse(factorial_scheem), factorial_result);

var quoted1 = "(quote (1 2 3))";
var quoted2 = "'(1 2 3)";
assert.deepEqual(scheem.parse(quoted1), scheem.parse(quoted2));

console.log("success!");
