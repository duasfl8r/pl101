var assert = require('assert');
var scheem = require('./scheem.js');

// Testing simple expression
var factorial_scheem = '(* n (factorial (- n 1)))';
var factorial_result = ["*", "n", ["factorial", ["-", "n", "1"]]];
assert.deepEqual(scheem.parse(factorial_scheem), factorial_result);

// Testing quoting with '()
var quoted1 = "(quote (1 2 3))";
var quoted2 = "'(1 2 3)";
assert.deepEqual(scheem.parse(quoted1), scheem.parse(quoted2));

// Testing comments
var commented = [';; this is a comment',
                 ';;',
                 '(+ (* 2 3) 7)',
                 ';; and this is another one',
                 ';; wait a little bit...',
                 '',
                 '',
                 ';; eat whole foods!'].join('\n');

var commented_result = ['+', ['*', '2', '3'], '7'];
assert.deepEqual(scheem.parse(commented), commented_result);

// Comments only in the beginning of the line
var wrong_comment1 = [' ;; i can has a space?',
                      '(+ 1 2)'].join('\n');
var wrong_comment2 = ['a;; i can has a letter?',
                      '(+ 1 2)'].join('\n');
var wrong_comment3 = ['(+ 1 2)',
                      ' ;; maybe after the expression... NOT!'];
var wrong_comment4 = '(+ 1 2) ;; same line?';

assert.throws(function() { scheem.parse(wrong_comment1); }, TypeError);
assert.throws(function() { scheem.parse(wrong_comment2); }, TypeError);
assert.throws(function() { scheem.parse(wrong_comment3); }, TypeError);

// "an empty input shouldn't parse"
var empty = "";
assert.throws(function() { scheem.parse(empty); }, TypeError);

// "An input that is just comments also shouldn't parse"

var just_comment = ';; just a comment';
assert.throws(function() { scheem.parse(just_comment); }, TypeError);
var just_comments = [';; this is a comment',
                     ';; and this is another'].join('\n');
assert.throws(function() { scheem.parse(just_comment); }, TypeError);

// Two expressions in a row shouldn't parse.
var two_expressions = '(* 1 2 (3 4 (5 6))) (+ a b (c d (e f)))'
assert.throws(function() { scheem.parse(two_expressions); }, TypeError);

console.log("success!");

// Arbitrary spacing
var dont_do_this_at_home = ['',
                            '(      =',
                            '     ( + ',
                            '1',
                            '2)',
                            '',
                            '\t\t\t3',
                            ')\t\t\t'].join('\n');
var dont_do_this_at_home_result = ['=', ['+', '1', '2'], '3'];
assert.deepEqual(scheem.parse(dont_do_this_at_home), dont_do_this_at_home_result);
