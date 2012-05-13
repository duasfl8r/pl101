/*jslint sloppy: true, white: true, stupid: true, node: true, nomen: true*/

var _;

var assert_true, map_eval, sbool, run_function;

var evalScheem;

var environment;
var push_scope, make_env_factory, update, lookup;

var make_env, initial_bindings;

if(typeof module !== 'undefined') {
    _ = require('underscore');

    environment = require('./environment');
    push_scope = environment.push_scope;
    make_env_factory = environment.make_env_factory;
    update = environment.update;
    lookup = environment.lookup;
    add_binding = environment.add_binding;
}

assert_true = function(condition, message) {
    if(!condition) {
        throw new Error(message);
    }
};

map_eval = function(exprs, env) {
    return _.map(exprs, function(e) { return evalScheem(e, env); });
};

run_function = function(func, args, env) {
};

sbool = function(a) {
    return Boolean(a) ? '#t' : '#f';
};

evalScheem = function (expr, env) {
    var result, i, evalued_args, list, elem, arg, rest, previous, env_, fn, lambda_arg, lambda_args;

    if (typeof expr === 'number') {
        return expr;
    }

    if (typeof expr === 'string') {
        return lookup(env, expr);
    }

    var func = expr[0];
    var args = expr.slice(1);

    try {
        switch (func) {
            case 'define':
                assert_true(typeof lookup(env, expr[1], true) === 'undefined', "Variable is already defined");
                assert_true(expr.length === 3, "'define' takes exactly 2 arguments, got " + String(expr.length - 1));
                add_binding(env, expr[1], evalScheem(expr[2], env));
                return 0;

            case 'set!':
                assert_true(typeof lookup(env, expr[1]) !== 'undefined', "Variable is not defined");
                assert_true(expr.length === 3, "'set!' takes exactly 2 arguments, got " + String(expr.length - 1));
                update(env, expr[1], evalScheem(expr[2], env));
                return 0;

            case 'begin':
               for(i = 1; i < expr.length; i+=1) {
                   result = evalScheem(expr[i], env);
               }

               return result;

            case 'quote':
               assert_true(expr.length === 2, "'quote' takes exactly 1 arguments, got " + String(expr.length - 1));
               return expr[1];

           case 'if':
               assert_true(expr.length === 4, "'if' takes exactly 3 arguments, got " + String(expr.length - 1));
               if(evalScheem(expr[1], env) === '#f') {
                   return evalScheem(expr[3], env);
               }
               return evalScheem(expr[2], env);
           case 'let-one':
               assert_true(expr.length === 4, "'let-one' takes exactly 3 arguments, got " + String(expr.length - 1));

               assert_true(_.isString(expr[1]), "First argument to 'let-one' must be a atom");
               env_ = push_scope(env);
               add_binding(env_, expr[1], evalScheem(expr[2], env_));
               return evalScheem(expr[3], env_);

           case 'let':
               assert_true(expr.length === 3, "'let' takes exactly 2 arguments, got " + String(expr.length - 1));
               env_ = push_scope(env);

               for(i=0; i<expr[1].length; i+=1) {
                   add_binding(env_, expr[1][i][0], evalScheem(expr[1][i][1], env_));
               }

               return evalScheem(expr[2], env_);

           case 'lambda-one':
               lambda_arg = expr[1];

               return function(lambda_arg_value) {
                   env_ = push_scope(env);
                   add_binding(env_, lambda_arg, lambda_arg_value);
                   return evalScheem(expr[2], env_);
               };

           case 'lambda':
               assert_true(_.isArray(args[0]), "First argument to 'lambda' must be list of atoms");
               assert_true(
                   _.filter(function(a) { !_.isString(a); }, args, args).length === 0,
                   "First argument to 'lambda' must be list of atoms"
               )
               lambda_args = args[0];

               return function() {
                   if(arguments.length !== lambda_args.length) {
                        throw new Error("'" + func + "' takes exactly " + lambda_args.length +
                                        " arguments, got " + arguments.length);
                   }

                   env_ = push_scope(env);
                   for(i=0; i<arguments.length; i+=1) {
                       add_binding(env_, lambda_args[i], arguments[i]);
                   }
                   return evalScheem(args[1], env_);
               };

           default:
               fn = evalScheem(func, env);
               args = map_eval(args, env);

               if(typeof fn !== 'function') {
                   throw new Error("Function '" + func  + "' has not been defined");
               }

               return fn.apply(null, args);
        }
    } catch(e) {
        console.error("ERROR: ", e);
        console.error("EXPRESSION: ", expr);
        console.error("ENVIRONMENT: ", env);
        process.exit(-1);
    };
};

initial_bindings = {
    '+': function() {
        assert_true(_.all(arguments, _.isNumber), "args of '+' must all be numbers");
        return _.reduce(arguments, function(a, b) { return a + b; }, 0);
    },
    '-': function() {
        arguments = Array.prototype.slice.call(arguments);

        assert_true(_.all(arguments, _.isNumber), "Arguments of '-' must all be numbers");
        assert_true(arguments.length > 0, "Don't call '-' without arguments!");
        return _.reduce(arguments.slice(1), function(a, b) { return a - b; }, arguments[0]);
    },
    '*': function() {
        assert_true(_.all(arguments, _.isNumber), "Arguments of '*' must all be numbers");
        return _.reduce(arguments, function(a, b) { return a * b; }, 1);
    },
    '/': function() {
        arguments = Array.prototype.slice.call(arguments);

        assert_true(_.all(arguments, _.isNumber), "Arguments of '/' must all be numbers");
        assert_true(arguments.length > 0, "Don't call '/' without arguments!");
        return _.reduce(arguments.slice(1), function(a, b) { return a / b; }, arguments[0]);
    },
    '=': function() {
        var arg, i;

        assert_true(_.all(arguments, _.isNumber), "Arguments of '=' must all be numbers");
 
        if(arguments.length === 0) {
            return '#t';
        }
 
        arg = arguments[0];
        for(i=1; i<arguments.length; i+=1) {
            if(arg !== arguments[i]) {
                return '#f';
            }
        }
        return '#t';
    },
    '<': function() {
        var previous, i;

        assert_true(_.all(arguments, _.isNumber), "Arguments of '<' must all be numbers");
        previous = -Infinity;
        for(i=0; i<arguments.length; i+=1) {
            if(previous >= arguments[i]) {
                return '#f';
            }
            previous = arguments[i];
        }
        return '#t';
    },
    '>': function() {
        var previous, i;

        assert_true(_.all(arguments, _.isNumber), "Arguments of '>' must all be numbers");
        previous = Infinity;
        for(i=0; i<arguments.length; i+=1) {
            if(previous <= arguments[i]) {
                return '#f';
            }
            previous = arguments[i];
        }
        return '#t';
    },
    'cons': function() {
        assert_true(_.isArray(arguments[1]), "The second argument to 'cons' must be a list");
        assert_true(arguments.length === 2, "'cons' takes exactly 2 arguments, got " + String(arguments.length));
        return [arguments[0]].concat(arguments[1]);
    },
    'car': function() {
        assert_true(arguments.length === 1, "'car' takes exactly 1 arguments, got " + String(arguments.length));
        assert_true(_.isArray(arguments[0]), "The argument to 'car' must be a non-empty list");
        assert_true(arguments[0].length > 0, "The argument to 'car' must be a non-empty list");
        return arguments[0][0];
    },
    'cdr': function() {
        arguments = Array.prototype.slice.call(arguments);

        assert_true(arguments.length === 1, "'cdr' takes exactly 1 arguments, got " + String(arguments.length));
        assert_true(_.isArray(arguments[0]), "The argument to 'cdr' must be a non-empty list");
        assert_true(arguments.length > 0, "The argument to 'cdr' must be a non-empty list");
        return arguments[0].slice(1);
    },
    'null?': function() {
        assert_true(arguments.length === 1, "'null' takes exactly 1 argument, got " + String(arguments.length));
        return sbool(_.isArray(arguments[0]) && _.isEmpty(arguments[0]));
    },
    'alert': function() {
        if(typeof module !== 'undefined') {
            console.log.apply(null, arguments);
        } else {
            alert(arguments);
        }
    },
    'modulo': function() {
        assert_true(_.all(arguments, _.isNumber), "Arguments of 'modulo' must all be numbers");
        assert_true(arguments.length == 2, "'modulo' takes exactly 2 arguments, got " + String(arguments.length));
        return arguments[0] % arguments[1];
    }
};

make_env = make_env_factory(initial_bindings);

if(typeof module !== 'undefined') {
    exports.evalScheem = evalScheem;
    exports.lookup = lookup;
    exports.make_env = make_env;
    exports.update = update;
    exports.add_binding = add_binding;
    exports.push_scope = push_scope;
    exports.initial_bindings = initial_bindings;
}
