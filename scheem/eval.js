/*jslint sloppy: true, white: true, stupid: true, node: true, nomen: true*/

var _;
if(typeof module !== 'undefined') {
    _ = require('underscore');
}

var clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

var check = function(condition, message) {
    if(!condition) {
        throw new Error(message);
    }
};

var push_scope = function(env) {
    env.outer = clone(env);
    env.bindings = {};
};

var pop_scope = function(env) {
    env.bindings = env.outer.bindings;
    env.outer = env.outer.outer;
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

var update = function(env, key, value, change_innermost) {
    change_innermost = (typeof change_innermost === 'undefined') ? false : change_innermost;

    if(_.has(env.bindings, key) || env.outer === null || change_innermost) {
        env.bindings[key] = value;
    } else {
        update(env.outer, key, value, false);
    }
}; 

var add_binding = function(e, k, v) { update(e, k, v, true) };

var lookup = function(env, v) {
    var v_;
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

    return lookup(env.outer, v);
};

var evalScheem = function (expr, env) {
    var result, i, args, head, tail, list, elem, arg, rest, previous, env_, fn, lambda_arg;

    if (typeof expr === 'number') {
        return expr;
    }

    if (typeof expr === 'string') {
        return lookup(env, expr);
    }

    head = expr[0];
    tail = expr.slice(1);

    switch (head) {
        case '+':
            args = _.map(tail, function(a) { return evalScheem(a, env); });
            check(_.all(args, _.isNumber), "Arguments of '+' must all be numbers");
            return _.reduce(args, function(a, b) { return a + b; }, 0);

        case '-':
            args = _.map(tail, function(a) { return evalScheem(a, env); });
            check(_.all(args, _.isNumber), "Arguments of '-' must all be numbers");
            check(args.length > 0, "Don't call '-' without arguments!");
            return _.reduce(args.slice(1), function(a, b) { return a - b; }, args[0]);

        case '*':
            args = _.map(tail, function(a) { return evalScheem(a, env); });
            check(_.all(args, _.isNumber), "Arguments of '*' must all be numbers");
            return _.reduce(args, function(a, b) { return a * b; }, 1);

        case '/':
            args = _.map(tail, function(a) { return evalScheem(a, env); });
            check(_.all(args, _.isNumber), "Arguments of '/' must all be numbers");
            check(args.length > 0, "Don't call '/' without arguments!");
            return _.reduce(args.slice(1), function(a, b) { return a / b; }, args[0]);

        case 'define':
            check(typeof lookup(env, expr[1]) === 'undefined', "Variable is already defined");
            check(expr.length === 3, "'define' takes exactly 2 arguments, got " + String(expr.length - 1));
            update(env, expr[1], evalScheem(expr[2], env));
            return 0;

       case 'set!':
            check(typeof lookup(env, expr[1]) !== 'undefined', "Variable is not defined");
            check(expr.length === 3, "'set!' takes exactly 2 arguments, got " + String(expr.length - 1));
            update(env, expr[1], evalScheem(expr[2], env));
            return 0;

       case 'begin':
           for(i = 1; i < expr.length; i+=1) {
               result = evalScheem(expr[i], env);
           }

           return result;

       case 'quote':
           check(expr.length === 2, "'quote' takes exactly 1 arguments, got " + String(expr.length - 1));
           return expr[1];

       case '=':
           args = _.map(tail, function(a) { return evalScheem(a, env); });
           check(_.all(args, _.isNumber), "Arguments of '=' must all be numbers");
           if(args.length === 0) {
               return '#t';
           }

           arg = args[0];
           for(i=1; i<args.length; i+=1) {
               if(arg !== args[i]) {
                   return '#f';
               }
           }

           return '#t';


       case '<':
           args = _.map(tail, function(a) { return evalScheem(a, env); });
           check(_.all(args, _.isNumber), "Arguments of '<' must all be numbers");
           previous = -Infinity;
           for(i=0; i<args.length; i+=1) {
               if(previous > args[i]) {
                   return '#f';
               }
               previous = args[i];
           }
           return '#t';

       case 'cons':
           args = _.map(tail, function(a) { return evalScheem(a, env); });
           check(_.isArray(args[1]), "The second argument to 'cons' must be a list");
           check(args.length === 2, "'cons' takes exactly 2 arguments, got " + String(args.length));
           return [args[0]].concat(args[1]);

       case 'car':
           check(expr.length === 2, "'car' takes exactly 1 arguments, got " + String(expr.length - 1));
           check(_.isArray(expr[1]), "The argument to 'car' must be a non-empty list");
           list = evalScheem(expr[1], env);
           check(list.length > 0, "The argument to 'car' must be a non-empty list");
           return list.length > 0 ? list[0] : undefined;

       case 'cdr':
           check(expr.length === 2, "'cdr' takes exactly 1 arguments, got " + String(expr.length - 1));
           check(_.isArray(expr[1]), "The argument to 'cdr' must be a non-empty list");
           list = evalScheem(expr[1], env);
           check(list.length > 0, "The argument to 'cdr' must be a non-empty list");
           return list.slice(1);

       case 'if':
           check(expr.length === 4, "'if' takes exactly 3 arguments, got " + String(expr.length - 1));
           if(evalScheem(expr[1], env) === '#f') {
               return evalScheem(expr[3], env);
           }
           return evalScheem(expr[2], env);
       case 'let-one':
           check(expr.length === 4, "'let-one' takes exactly 3 arguments, got " + String(expr.length - 1));

           env_ = clone(env);
           push_scope(env_);
           update(env_, expr[1], evalScheem(expr[2], env_));
           return evalScheem(expr[3], env_);
       case 'lambda-one':
           lambda_arg = expr[1];

           return function(lambda_arg_value) {
               env_ = clone(env);
               push_scope(env_);
               update(env_, lambda_arg, lambda_arg_value, true);
               return evalScheem(expr[2], env_);
           };

       default:
           fn = evalScheem(expr[0], env);
           arg = evalScheem(expr[1], env);
           return fn(arg);
    }
};

if(typeof module !== 'undefined') {
    exports.evalScheem = evalScheem;
    exports.lookup = lookup;
    exports.make_env = make_env;
    exports.update = update;
    exports.add_binding = add_binding;
}
