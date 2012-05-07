/*jslint sloppy: true, white: true, stupid: true, node: true, nomen: true*/

var _;
if(typeof module !== 'undefined') {
    _ = require('underscore');
}

var check = function(condition, message) {
    if(!condition) {
        throw new Error(message);
    }
};

var evalScheem = function (expr, env) {
    var result, i, args, head, tail, list, elem, arg, rest, previous;

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }

    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
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
            check(typeof env[expr[1]] === 'undefined', "Variable is already defined");
            check(expr.length === 3, "'define' takes exactly 2 arguments, got " + String(expr.length - 1));
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;

       case 'set!':
            check(typeof env[expr[1]] !== 'undefined', "Variable is not defined");
            check(expr.length === 3, "'set!' takes exactly 2 arguments, got " + String(expr.length - 1));
            env[expr[1]] = evalScheem(expr[2], env);
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
           check(expr.length === 4, "'cdr' takes exactly 3 arguments, got " + String(expr.length - 1));
           if(evalScheem(expr[1], env) === '#f') {
               return evalScheem(expr[3], env);
           }
           return evalScheem(expr[2], env);
    }
};

if(typeof module !== 'undefined') {
    exports.evalScheem = evalScheem;
}
