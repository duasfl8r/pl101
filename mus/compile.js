// MUS Abstract Syntax Tree compiler
// Lucas Teixeira, 2012-04-20

/* Calculates the end time of a expression 'expr', given the initial time
 * 'time' of that expression.
 */
var endTime = function (time, expr) {
    var exprTime = function(expr) {
        switch(expr.tag) {
            case 'rest':
            case 'note':
                return expr.dur;
            case 'seq':
                return exprTime(expr.left) + exprTime(expr.right);
            case 'par':
                return Math.max(exprTime(expr.left), exprTime(expr.right));
	}
    };

    return time + exprTime(expr);
};


var pitchLetter = {
    c: 0,
    d: 2,
    e: 4,
    f: 5,
    g: 7,
    a: 9,
    b: 11
};

var convertPitch = function(pitch) {
    var letter = pitch[0];
    var octave = pitch[1];
    return 12 + (12 * octave) + pitchLetter[letter];
}


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
                    pitch: convertPitch(expr.pitch),
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

exports.compile = compile;
