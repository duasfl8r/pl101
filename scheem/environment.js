var _;

if(typeof module !== 'undefined') {
    _ = require('underscore');
}

var push_scope = function(env) {
    var env_ = {};
    env_.bindings = {};
    env_.outer = env;
    return env_;
};

var make_env_factory = function(initial_bindings) {
    return function(bindings) {
        if(typeof bindings === 'undefined') {
            bindings = {};
        }

        return {
            bindings: bindings,
            outer: {
                bindings: initial_bindings,
                outer: null
            }
        };
    }
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

if(typeof module !== 'undefined') {
    exports.push_scope = push_scope;
    exports.make_env_factory = make_env_factory;
    exports.update = update;
    exports.lookup = lookup;
    exports.add_binding = add_binding;
}
