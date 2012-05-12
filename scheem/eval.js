/*jslint sloppy: true, white: true, stupid: true, node: true, nomen: true*/

var _;
if(typeof module !== 'undefined') {
    _ = require('underscore');
}

var assert_true = function(condition, message) {
    if(!condition) {
        throw new Error(message);
    }
};

var push_scope = function(env) {
    var env_ = {};
    env_.bindings = {};
    env_.outer = env;
    return env_;
};

var make_env = function(bindings) {
    if(typeof bindings === 'undefined') {
        bindings = {};
    }

    return {
        bindings: bindings,
        outer: null
    };
};

var update = function(env, key, value, on_innermost) {
    on_innermost = (typeof on_innermost === 'undefined') ? false : on_innermost;

    if(_.has(env.bindings, key) || env.outer === null || on_innermost) {
        env.bindings[key] = value;
    } else {
        update(env.outer, key, value, false);
    }
}; 

var add_binding = function(e, k, v) { update(e, k, v, true) };

var lookup = function(env, v, on_innermost) {
    var v_;

    on_innermost = (typeof on_innermost === 'undefined') ? false : on_innermost;

    try {
        for(v_ in env.bindings) {
            if(env.bindings.hasOwnProperty(v_)) {
                if(v === v_) {
                    return env.bindings[v_];
                }
            }
        }
    } catch(e) {
        if(e.name === 'TypeError') {
            return undefined;
        }
        throw e;
    }

    if(on_innermost) {
        return undefined;
    }

    return lookup(env.outer, v, false);
};

var map_eval = function(exprs, env) {
    return _.map(exprs, function(e) { return evalScheem(e, env); });
};

var evalScheem = function (expr, env) {
    var result, i, evalued_args, func, args, list, elem, arg, rest, previous, env_, fn, lambda_arg;

    if (typeof expr === 'number') {
        return expr;
    }

    if (typeof expr === 'string') {
        return lookup(env, expr);
    }

    func = expr[0];
    args = expr.slice(1);

    switch (func) {
        case '+':
            evalued_args = map_eval(args, env);
            assert_true(_.all(evalued_args, _.isNumber), "Arguments of '+' must all be numbers");
            return _.reduce(evalued_args, function(a, b) { return a + b; }, 0);

        case '-':
            evalued_args = map_eval(args, env);
            assert_true(_.all(evalued_args, _.isNumber), "Arguments of '-' must all be numbers");
            assert_true(evalued_args.length > 0, "Don't call '-' without arguments!");
            return _.reduce(evalued_args.slice(1), function(a, b) { return a - b; }, evalued_args[0]);

        case '*':
            evalued_args = map_eval(args, env);
            assert_true(_.all(evalued_args, _.isNumber), "Arguments of '*' must all be numbers");
            return _.reduce(evalued_args, function(a, b) { return a * b; }, 1);

        case '/':
            evalued_args = map_eval(args, env);
            assert_true(_.all(evalued_args, _.isNumber), "Arguments of '/' must all be numbers");
            assert_true(evalued_args.length > 0, "Don't call '/' without arguments!");
            return _.reduce(evalued_args.slice(1), function(a, b) { return a / b; }, evalued_args[0]);

        case 'define':
            assert_true(typeof lookup(env, expr[1], true) === 'undefined', "Variable is already defined");
            assert_true(expr.length === 3, "'define' takes exactly 2 arguments, got " + String(expr.length - 1));
            update(env, expr[1], evalScheem(expr[2], env));
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

       case '=':
           evalued_args = map_eval(args, env);
           assert_true(_.all(evalued_args, _.isNumber), "Arguments of '=' must all be numbers");

           if(evalued_args.length === 0) {
               return '#t';
           }

           arg = evalued_args[0];
           for(i=1; i<evalued_args.length; i+=1) {
               if(arg !== evalued_args[i]) {
                   return '#f';
               }
           }

           return '#t';


       case '<':
           evalued_args = map_eval(args, env);
           assert_true(_.all(evalued_args, _.isNumber), "Arguments of '<' must all be numbers");
           previous = -Infinity;
           for(i=0; i<evalued_args.length; i+=1) {
               if(previous >= evalued_args[i]) {
                   return '#f';
               }
               previous = evalued_args[i];
           }
           return '#t';

       case 'cons':
           evalued_args = map_eval(args, env);
           assert_true(_.isArray(evalued_args[1]), "The second argument to 'cons' must be a list");
           assert_true(evalued_args.length === 2, "'cons' takes exactly 2 arguments, got " + String(evalued_args.length));
           return [evalued_args[0]].concat(evalued_args[1]);

       case 'car':
           assert_true(expr.length === 2, "'car' takes exactly 1 arguments, got " + String(expr.length - 1));
           assert_true(_.isArray(expr[1]), "The argument to 'car' must be a non-empty list");
           list = evalScheem(expr[1], env);
           assert_true(list.length > 0, "The argument to 'car' must be a non-empty list");
           return list[0];

       case 'cdr':
           assert_true(expr.length === 2, "'cdr' takes exactly 1 arguments, got " + String(expr.length - 1));
           assert_true(_.isArray(expr[1]), "The argument to 'cdr' must be a non-empty list");
           list = evalScheem(expr[1], env);
           assert_true(list.length > 0, "The argument to 'cdr' must be a non-empty list");
           return list.slice(1);

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
           update(env_, expr[1], evalScheem(expr[2], env_), true);
           return evalScheem(expr[3], env_);

       case 'lambda-one':
           lambda_arg = expr[1];

           return function(lambda_arg_value) {
               env_ = push_scope(env);
               update(env_, lambda_arg, lambda_arg_value, true);
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
                   update(env_, lambda_args[i], arguments[i], true);
               }
               return evalScheem(args[1], env_);
           };

       default:
           fn = evalScheem(func, env);
           args = map_eval(args, env);

           return fn.apply(null, args);
    }
};

if(typeof module !== 'undefined') {
    exports.evalScheem = evalScheem;
    exports.lookup = lookup;
    exports.make_env = make_env;
    exports.update = update;
    exports.add_binding = add_binding;
    exports.push_scope = push_scope;
}
