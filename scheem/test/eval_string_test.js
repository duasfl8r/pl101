/*jslint sloppy: true, white: true, stupid: true, node: true */
/*global suite, test, chai */

var assert, evalScheemString;
if(typeof module !== 'undefined') {
    assert = require('chai').assert;
    evalScheemString = require('../eval_string').evalScheemString;
} else {
    assert = chai.assert;
}

suite('sum', function() {
    test('of two numbers', function() {
        assert.equal(evalScheemString('(+ 3 4)', {}), 7);
    });

    test('of two variables', function() {
        assert.equal(evalScheemString('(+ x y)', { bindings: { x: 3, y: 4 } }), 7);
    });

    test('of two expressions', function() {
        assert.equal(evalScheemString('(+ (+ 1 2) (* 2 2))', {}), 7);
    });
});
