/*jslint sloppy: true, white: true, stupid: true, node: true */
/*global suite, test, chai */ 

var assert, expect, scheem, evalScheem, lookup, make_env, update;
if(typeof module !== 'undefined') {
    assert = require('chai').assert;
    expect = require('chai').expect;
    evalScheem = require('../eval').evalScheem;
    lookup = require('../eval').lookup;
    make_env = require('../eval').make_env;
    update = require('../eval').update;
    add_binding = require('../eval').add_binding;
} else {
    assert = chai.assert;
    expect = chai.expect;
}

suite('arithmetics', function() {
    test('addition', function() {
        assert.equal(evalScheem(['+', 10, 5], make_env()), 15);
    });

    test('addition, 3 arguments', function() {
        assert.equal(evalScheem(['+', 10, 2, 3], make_env()), 15);
    });

    test('subtraction', function() {
        assert.equal(evalScheem(['-', 10, 5], make_env()), 5);
    });

    test('subtraction, 3 arguments', function() {
        assert.equal(evalScheem(['-', 10, 5, 3], make_env()), 2);
    });

    test('subtraction, no arguments', function() {
        expect(function(){ evalScheem(['-'], make_env()); }).to.throw();
    });

    test('multiplication', function() {
        assert.equal(evalScheem(['*', 10, 5], make_env()), 50);
    });

    test('multiplication, 3 arguments', function() {
        assert.equal(evalScheem(['*', 10, 2, 3], make_env()), 60);
    });

    test('division', function() {
        assert.equal(evalScheem(['/', 10, 5], make_env()), 2);
    });

    test('division, 3 arguments', function() {
        assert.equal(evalScheem(['/', 20, 5, 2], make_env()), 2);
    });

    test('division, no arguments', function() {
        expect(function(){ evalScheem(['/'], make_env()); }).to.throw();
    });
});

suite('define', function() {
    test('as a literal', function() {
        var env = make_env(), expr = ['define', 'x', 10];
        assert.equal(evalScheem(expr, env), 0); // return code
        assert.deepEqual(env.bindings, { x: 10 });
    });

    test('as a variable', function() {
        var env = make_env({ y: 30 }), expr = ['define', 'x', 'y'];
        evalScheem(expr, env);
        assert.equal(env.bindings.x, 30);
    });

    test('an already defined variable throws an error', function() {
        var env = make_env({ x: 30 }), expr = ['define', 'x', 120 ];
        assert.throws(function() {
            evalScheem(expr, env);
        }, /already defined/);
    });
});

suite('set!', function() {
    test('as a literal', function() {
        var env = make_env({ x: 20 }), expr = ['set!', 'x', 10];
        assert.equal(evalScheem(expr, env), 0); // return code
        assert.deepEqual(env.bindings, { x: 10 });
    });

    test('as a variable', function() {
        var env = make_env({ y: 30, x: 40 }), expr = ['set!', 'x', 'y'];
        evalScheem(expr, env);
        assert.equal(env.bindings.x, 30);
    });

    test('an undefined variable throws an error', function() {
        var env = make_env(), expr = ['set!', 'x', 120 ];
        assert.throws(function() {
            evalScheem(expr, env);
        }, /not defined/);
    });
});

suite('begin:', function() {
    test('defines, sets, increments', function() {
        var env = make_env(), prg, result;

        prg = ['begin', 
                    ['define', 'x', 5], 
                    ['set!', 'x', ['+', 'x', 1]], 
                    ['+', 2, 'x']];

        result = evalScheem(prg, env);
        assert.equal(result, 8);
        assert.equal(env.bindings.x, 6);
    });
});

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], make_env()),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], make_env()),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], make_env()),
            [1, 2, 3]
        );
    });
});

suite('equal', function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 3], make_env()),
            '#t'
        );
    });

    test('three numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 3, 3], make_env()),
            '#t'
        );
    });

    test('variable and number', function() {
        assert.equal(
            evalScheem(['=', 'x', 3], make_env({ x: 3 })),
            '#t'
        );
    });

    test('variable and variable', function() {
        assert.equal(
            evalScheem(['=', 'x', 'y'], make_env({ x: 3, y: 3 })),
            '#t'
        );
    });

    test('variable and expression', function() {
        assert.equal(
            evalScheem(['=', 'x', ['+', 2, 1]], make_env({ x: 3 })),
            '#t'
        );
    });
});

suite('different', function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 4], { bindings: make_env() }),
            '#f'
        );
    });

    test('three numbers', function() {
        assert.equal(
            evalScheem(['=', 3, 3, 4], { bindings: make_env() }),
            '#f'
        );
    });

    test('variable and number', function() {
        assert.equal(
            evalScheem(['=', 'x', 4], make_env({ x: 3 })),
            '#f'
        );
    });

    test('variable and variable', function() {
        assert.equal(
            evalScheem(['=', 'x', 'y'], make_env({ x: 3, y: 4 })),
            '#f'
        );
    });

    test('variable and expression', function() {
        assert.equal(
            evalScheem(['=', 'x', ['+', 2, 2]], make_env({ x: 3 })),
            '#f'
        );
    });
});

suite("less than", function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 4], make_env()),
            '#t'
        );
    });

    test('four numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 4, 5, 100], make_env()),
            '#t'
        );
    });

    test('variable and number', function() {
        assert.equal(
            evalScheem(['<', 'x', 4], make_env({ x: 3 })),
            '#t'
        );
    });

    test('variable and variable', function() {
        assert.equal(
            evalScheem(['<', 'x', 'y'], make_env({ x: 3, y: 4 })),
            '#t'
        );
    });

    test('variable and expression', function() {
        assert.equal(
            evalScheem(['<', 'x', ['+', 2, 2]], make_env({ x: 3 })),
            '#t'
        );
    });
});

suite("not less than", function() {
    test('two numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 2], make_env()),
            '#f'
        );
    });

    test('four numbers', function() {
        assert.equal(
            evalScheem(['<', 3, 4, 100, 99], make_env()),
            '#f'
        );
    });
});

suite('cons', function() {
    test('a number to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', 1, ['quote', [2, 3]]], make_env()),
            [1, 2, 3]
        );
    });

    test('an expression to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', ['-', 30, 29], ['quote', [2, 3]]], make_env()),
            [1, 2, 3]
        );
    });

    test('an list to a list', function() {
        assert.deepEqual(
            evalScheem(['cons', ['quote', [0, 1]], ['quote', [2, 3]]], make_env()),
            [[0, 1], 2, 3]
        );
    });

    test('with wrong arguments', function() {
        expect(function() {
            evalScheem(['cons', 3, 4], make_env());
        }).to.throw();
    });

    test('with too much arguments', function() {
        expect(function() {
            evalScheem(['cons', 3, [1, 2, 3], [4, 5, 6]], make_env());
        }).to.throw();
    });
});

suite('car', function() {
    test('of a list', function() {
        assert.equal(
            evalScheem(['car', ['quote', [1, 2, 3, 4]]], make_env()),
            1
        );
    });
});

suite('cdr', function() {
    test('of a list', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', [1, 2, 3, 4]]], make_env()),
            [2, 3, 4]
        );
    });
});

suite('if', function() {
    test('true condition then number else number', function() {
        assert.equal(
            evalScheem(['if', ['<', 'x', 5], 0, 10], make_env({ x: 3 })),
            0
        );
    });

    test('false condition then number else number', function() {
        assert.equal(
            evalScheem(['if', ['<', 'x', 5], 0, 10], make_env({ x: 7 })),
            10
        );
    });

    test('true condition then set! else set!', function() {
        var env = make_env({ x: 3, a: 'something', b: 'something' });

        evalScheem(['if', ['<', 'x', 5],
                        ['set!', 'a', ['quote', 'something-else']],
                        ['set!', 'b', ['quote', 'something-else']]], env);

        assert.equal(lookup(env, 'a'), 'something-else');
        assert.equal(lookup(env, 'b'), 'something');
    });
});

suite('lookup', function() {
    var env1 = { bindings: {'x': 19}, outer: { } };
    var env2 = { bindings: {'y': 16}, outer: env1 };
    var env3 = { bindings: {'x': 2}, outer: env2 };

    test('single binding', function() {
        assert.equal(lookup(env1, 'x'), 19);
    });

    test('double binding inner', function() {
        assert.equal(lookup(env2, 'y'), 16);
    });

    test('double binding outer', function() {
        assert.equal(lookup(env2, 'x'), 19);
    });

    test('triple binding inner', function() {
        assert.equal(lookup(env3, 'x'), 2);
    });
});

suite('let-one', function() {
    var expr;
    test('simple sum', function() {
        assert.equal(3, evalScheem(['let-one', 'x', 2, ['+', 'x', 1]], make_env()));
    });

    test('shadowing', function() {
        expr = ["let-one","x",2,["+",["let-one","x",3,"x"],["let-one","y",4,"x"]]];
        assert.equal(5, evalScheem(expr, make_env()));
    });
});

suite('update', function() {
    var env1 = { bindings: {'x': 19}, outer: { } };
    var env1u = { bindings: {'x': 20}, outer: { } };
    var env2 = { bindings: {'y': 16}, outer:
        { bindings: {'x': 19}, outer: { } }};
    var env2u = { bindings: {'y': 10}, outer:
        { bindings: {'x': 19}, outer: { } }};
    var env2v = { bindings: {'y': 10}, outer:
        { bindings: {'x': 20}, outer: { } }};
    var env3 = { bindings: {'x': 2}, outer: 
        { bindings: {'y': 16}, outer: 
            { bindings: {'x': 19}, outer: { } }}};
    var env3u = { bindings: {'x': 9}, outer:
        { bindings: {'y': 16}, outer: 
            { bindings: {'x': 19}, outer: { } }}};

    test('Single binding', function() {
        update(env1, 'x', 20);
        assert.deepEqual(env1, env1u);
    });
    test('Double binding inner', function() {
        update(env2, 'y', 10);
        assert.deepEqual(env2, env2u);
    });
    test('Double binding outer', function() {
        update(env2, 'x', 20);
        assert.deepEqual(env2, env2v);
    });
    test('Triple binding inner', function() {
        update(env3, 'x', 9);
        assert.deepEqual(env3, env3u)
    });
});

suite('one argument function', function() {
    var always3 = function (x) { return 3; };
    var identity = function (x) { return x; };
    var plusone = function (x) { return x + 1; };
    var env = {
        bindings: {
            'always3': always3,
            'identity': identity,
            'plusone': plusone
        },
        outer: {}
    };


    test('(always3 5)', function() {
        assert.deepEqual(evalScheem(['always3', 5], env), 3);
    });
    test('(identity 5)', function() {
        assert.deepEqual(evalScheem(['identity', 5], env), 5);
    });
    test('(plusone 5)', function() {
        assert.deepEqual(evalScheem(['plusone', 5], env), 6);
    });
    test('(plusone (always3 5))', function() {
        assert.deepEqual(evalScheem(['plusone', ['always3', 5]], env), 4);
    });
    test('plusone', function() {
        assert.equal(
            evalScheem(
                ['plusone', ['+', ['plusone', 2], ['plusone', 3]]],
                env
            ),
            8
        );
    });
});

suite('lambda-one', function() {
    test('((lambda-one x x) 5)', function() {
        assert.deepEqual(evalScheem([['lambda-one', 'x', 'x'], 5], { }), 5);
    });
    test('((lambda-one x (+ x 1)) 5)', function() {
        assert.deepEqual(evalScheem([['lambda-one', 'x', ['+', 'x', 1]], 5], { }), 6);
    });

    test('(((lambda-one x (lambda-one y (+ x y))) 5) 3)', function() {
        assert.deepEqual(evalScheem([[['lambda-one', 'x', ['lambda-one', 'y', ['+', 'x', 'y']]], 5], 3], { }), 8);
    });

    test('(((lambda-one x (lambda-one x (+ x x))) 5) 3)', function() {
        assert.deepEqual(evalScheem([[['lambda-one', 'x', ['lambda-one', 'x', ['+', 'x', 'x']]], 5], 3], { }), 6);
    });
});

suite('add binding', function() {
    var env1 = { bindings: {'x': 19}, outer: { } };
    var env1u = { bindings: {'x': 19, 'y': 3}, outer: { } };

    var env2 = { bindings: {'y': 16}, outer:
            { bindings: {'x': 19}, outer: { } }};
    var env2u = { bindings: {'z': 9, 'y': 16}, outer:
            { bindings: {'x': 19}, outer: { } }};

    test('Simple new binding', function() {
        add_binding(env1, 'y', 3);
        assert.deepEqual(env1, env1u);
    });

    test('New binding', function() {
        add_binding(env2, 'z', 9);
        assert.deepEqual(env2, env2u);
    });
});
