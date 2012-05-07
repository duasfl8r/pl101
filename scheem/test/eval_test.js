/*jslint sloppy: true, white: true, stupid: true, node: true */
/*global suite, test, chai */

var assert, expect, scheem, evalScheem;
if(typeof module !== 'undefined') {
    assert = require('chai').assert;
    expect = require('chai').expect;
    evalScheem = require('../eval').evalScheem;
} else {
    assert = chai.assert;
    expect = chai.expect;
}

suite('arithmetics', function() {
    test('addition', function() {
        assert.equal(evalScheem(['+', 10, 5], {}), 15);
    });

    test('addition, 3 arguments', function() {
        assert.equal(evalScheem(['+', 10, 2, 3], {}), 15);
    });

    test('subtraction', function() {
        assert.equal(evalScheem(['-', 10, 5], {}), 5);
    });

    test('subtraction, 3 arguments', function() {
        assert.equal(evalScheem(['-', 10, 5, 3], {}), 2);
    });

    test('subtraction, no arguments', function() {
        expect(function(){ evalScheem(['-'], {}); }).to.throw();
    });

    test('multiplication', function() {
        assert.equal(evalScheem(['*', 10, 5], {}), 50);
    });

    test('multiplication, 3 arguments', function() {
        assert.equal(evalScheem(['*', 10, 2, 3], {}), 60);
    });

    test('division', function() {
        assert.equal(evalScheem(['/', 10, 5], {}), 2);
    });

    test('division, 3 arguments', function() {
        assert.equal(evalScheem(['/', 20, 5, 2], {}), 2);
    });

    test('division, no arguments', function() {
        expect(function(){ evalScheem(['/'], {}); }).to.throw();
    });
});

suite('define', function() {
    test('as a literal', function() {
        var env = {}, expr = ['define', 'x', 10];
        assert.equal(evalScheem(expr, env), 0); // return code
        assert.deepEqual(env, { x: 10 });
    });

    test('as a variable', function() {
        var env = { y: 30 }, expr = ['define', 'x', 'y'];
        evalScheem(expr, env);
        assert.equal(env.x, 30);
    });

    test('an already defined variable throws an error', function() {
        var env = { x: 30 }, expr = ['define', 'x', 120 ];
        assert.throws(function() {
            evalScheem(expr, env);
        }, /already defined/);
    });
});

suite('set!', function() {
    test('as a literal', function() {
        var env = { x: 20 }, expr = ['set!', 'x', 10];
        assert.equal(evalScheem(expr, env), 0); // return code
        assert.deepEqual(env, { 'x': 10 });
    });

    test('as a variable', function() {
        var env = { y: 30, x: 40 }, expr = ['set!', 'x', 'y'];
        evalScheem(expr, env);
        assert.equal(env.x, 30);
    });

    test('an undefined variable throws an error', function() {
        var env = {}, expr = ['set!', 'x', 120 ];
        assert.throws(function() {
            evalScheem(expr, env);
        }, /not defined/);
    });
});

suite('begin:', function() {
    test('defines, sets, increments', function() {
        var env = {}, prg, result;

        prg = ['begin', 
                    ['define', 'x', 5], 
                    ['set!', 'x', ['+', 'x', 1]], 
                    ['+', 2, 'x']];

        result = evalScheem(prg, env);
        assert.equal(result, 8);
        assert.equal(env.x, 6);
    });
});

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});

suite('equal', function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 3], {}),
            '#t'
        );
    });

    test('three numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 3, 3], {}),
            '#t'
        );
    });

    test('variable and number', function() {
        assert.equal(
            evalScheem(['=', 'x', 3], { x: 3 }),
            '#t'
        );
    });

    test('variable and variable', function() {
        assert.equal(
            evalScheem(['=', 'x', 'y'], { x: 3, y: 3 }),
            '#t'
        );
    });

    test('variable and expression', function() {
        assert.equal(
            evalScheem(['=', 'x', ['+', 2, 1]], { x: 3 }),
            '#t'
        );
    });
});

suite('different', function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 4], {}),
            '#f'
        );
    });

    test('three numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 3, 4], {}),
            '#f'
        );
    });

    test('variable and number', function() {
        assert.equal(
            evalScheem(['=', 'x', 4], { x: 3 }),
            '#f'
        );
    });

    test('variable and variable', function() {
        assert.equal(
            evalScheem(['=', 'x', 'y'], { x: 3, y: 4 }),
            '#f'
        );
    });

    test('variable and expression', function() {
        assert.equal(
            evalScheem(['=', 'x', ['+', 2, 2]], { x: 3 }),
            '#f'
        );
    });
});

suite("less than", function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 4], {}),
            '#t'
        );
    });

    test('four numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 4, 5, 100], {}),
            '#t'
        );
    });

    test('variable and number', function() {
        assert.equal(
            evalScheem(['<', 'x', 4], { x: 3 }),
            '#t'
        );
    });

    test('variable and variable', function() {
        assert.equal(
            evalScheem(['<', 'x', 'y'], { x: 3, y: 4 }),
            '#t'
        );
    });

    test('variable and expression', function() {
        assert.equal(
            evalScheem(['<', 'x', ['+', 2, 2]], { x: 3 }),
            '#t'
        );
    });
});

suite("not less than", function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 2], {}),
            '#f'
        );
    });

    test('four numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 4, 100, 99], {}),
            '#f'
        );
    });
});

suite('cons', function() {
    test('a number to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', 1, ['quote', [2, 3]]], {}),
            [1, 2, 3]
        );
    });

    test('an expression to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', ['-', 30, 29], ['quote', [2, 3]]], {}),
            [1, 2, 3]
        );
    });

    test('an list to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', ['quote', [0, 1]], ['quote', [2, 3]]], {}),
            [[0, 1], 2, 3]
        );
    });

    test('with wrong arguments', function() {
        expect(function() {
            evalScheem(['cons', 3, 4], {});
        }).to.throw();
    });

    test('with too much arguments', function() {
        expect(function() {
            evalScheem(['cons', 3, [1, 2, 3], [4, 5, 6]], {});
        }).to.throw();
    });
});

suite('car', function() {
    test('of a list', function() {
        assert.equal(
            evalScheem(['car', ['quote', [1, 2, 3, 4]]], {}),
            1
        );
    });
});

suite('cdr', function() {
    test('of a list', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', [1, 2, 3, 4]]], {}),
            [2, 3, 4]
        );
    });
});

suite('if', function() {
    test('true condition then number else number', function() {
        assert.equal(
            evalScheem(['if', ['<', 'x', 5], 0, 10], { x: 3 }),
            0
        );
    });

    test('false condition then number else number', function() {
        assert.equal(
            evalScheem(['if', ['<', 'x', 5], 0, 10], { x: 7 }),
            10
        );
    });

    test('true condition then set! else set!', function() {
        var env = { x: 3, a: 'something', b: 'something' };

        evalScheem(['if', ['<', 'x', 5],
                        ['set!', 'a', ['quote', 'something-else']],
                        ['set!', 'b', ['quote', 'something-else']]], env);

        assert.equal(env.a, 'something-else');
        assert.equal(env.b, 'something');
    });
});
