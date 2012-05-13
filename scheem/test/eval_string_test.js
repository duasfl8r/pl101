/*jslint sloppy: true, white: true, stupid: true, node: true */
/*global suite, test, chai */
var assert, evalScheemString;
var environment, make_env_factory, initial_bindings;
var make_env;

if(typeof module !== 'undefined') {
    assert = require('chai').assert;
    evalScheemString = require('../eval_string').evalScheemString;

    environment = require('../environment');
    make_env_factory = environment.make_env_factory;
    initial_bindings = require('../eval').initial_bindings;
} else {
    assert = chai.assert;
}

make_env = make_env_factory(initial_bindings);

suite('sum', function() {
    test('of two numbers', function() {
        assert.equal(evalScheemString('(+ 3 4)', make_env()), 7);
    });

    test('of two variables', function() {
        assert.equal(evalScheemString('(+ x y)', make_env({ x: 3, y: 4 })), 7);
    });

    test('of two expressions', function() {
        assert.equal(evalScheemString('(+ (+ 1 2) (* 2 2))', make_env()), 7);
    });
});
