/*jslint sloppy: true, white: true, stupid: true, node: true */
/*global suite, test, SCHEEM, chai */

var PEG, fs, rules, parse, assert;
if(typeof module !== 'undefined') {
    assert = require('chai').assert;
    PEG = require('pegjs');
    fs = require('fs');
    rules = fs.readFileSync('scheem.peg', 'utf-8');
    parse = PEG.buildParser(rules).parse;
} else {
    parse = SCHEEM.parse;
    assert = chai.assert;
}


suite('expression:', function() {
    test('factorial recursive case', function() {
        var fat, result;
        fat = '(* n (factorial (- n 1)))';
        result = ["*", "n", ["factorial", ["-", "n", 1]]];
        assert.deepEqual(parse(fat), result);
    });

    test('quoting with \'(...)', function() {
        var quoted1, quoted2;
        quoted1 = "(quote (1 2 3))";
        quoted2 = "'(1 2 3)";
        assert.deepEqual(parse(quoted1), parse(quoted2));
    });
    
    test('lots of spacing', function() {
        var expr, result;
        expr = ['',
                '(      =',
                '     ( + ',
                '1',
                '2)',
                '',
                '\t\t\t3',
                ')\t\t\t'].join('\n');
        result = ['=', ['+', 1, 2], 3];
        assert.deepEqual(parse(expr), result);
    });
});

suite('comments', function() {
    test('before and after, with blank lines', function() {
        var expr, result;
        expr = [';; this is a comment',
                         ';;',
                         '(+ (* 2 3) 7)',
                         ';; and this is another one',
                         ';; wait a little bit...',
                         '',
                         '',
                         ';; eat whole foods!\n'].join('\n');

        result = ['+', ['*', 2, 3], 7];
        assert.deepEqual(parse(expr), result);
    });
});


suite('should not parse:', function() {
    test('an empty input', function() {
        var empty = "";
        assert.throws(function() { parse(empty); }, SyntaxError);
    });

    test('comments only', function() {
        var one_line, two_lines;

        one_line = ';; just a comment';
        assert.throws(function() { parse(one_line); }, SyntaxError);

        two_lines = [';; this is a comment',
                     ';; and this is another'].join('\n');
        assert.throws(function() { parse(two_lines); }, SyntaxError);
    });

    test('two expressions in a row', function() {
        var two_expressions = '(* 1 2 (3 4 (5 6))) (+ a b (c d (e f)))';
        assert.throws(function() { parse(two_expressions); }, SyntaxError);
    });
});
