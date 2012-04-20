// MUS Abstract Syntax Tree compiler
// Lucas Teixeira, 2012-04-20

/* Calculates the end time of a expression 'expr', given the initial time
 * 'time' of that expression.
 */
var endTime = function (time, expr) {
    var exprTime = function(expr) {
        switch(expr.tag) {
            case 'note':
                return expr.dur;
            case 'seq':
                return exprTime(expr.left) + exprTime(expr.right);
            case 'par': return Math.max(exprTime(expr.left), exprTime(expr.right)); }
    };

    return time + exprTime(expr);
};


/* Compiles 'musexpr', which is a Abstract Syntax Tree for the MUS language,
 * into a NOTE program.
 *
 * Supports 'note', 'seq' and 'par' expressions.
 */
var compile = function(musexpr) {
    var build = [];

    var run_tree = function(expr, time) {
        switch(expr.tag) {
            case 'note':
                build.push({ 
                    tag: 'note',
                    pitch: expr.pitch,
                    start: time,
                    dur: expr.dur
                });
                break;
            case 'seq':
                run_tree(expr.left, time);
                run_tree(expr.right, endTime(time, expr.left));
                break;
            case 'par':
                run_tree(expr.left, time);
                run_tree(expr.right, time);
                break;
        }
    };
    
    run_tree(musexpr, 0);
    return build;
};
