// MUS Abstract Syntax Tree compiler
// Lucas Teixeira, 2012-04-20

// Calculates the end time of a expression 'expr', given the initial time
// 'time' of that expression.
//
// This function will be used on the 'compile' function, to calculate the time
// offset that the right section of an 'seq' expression will have, in relation
// to the left section.
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
            case 'repeat':
                return exprTime(expr.section) * expr.count;
	}
    };

    return time + exprTime(expr);
};

// Converts "letter-octave" pitches (e.g. "a4") to number pitches (e.g. 60).
var convertPitch = function(pitch) {
    var pitchLetter = {
        c: 0,
        d: 2,
        e: 4,
        f: 5,
        g: 7,
        a: 9,
        b: 11
    };

    var letter = pitch[0].toLowerCase();
    var octave = pitch[1];

    return 12 + (12 * octave) + pitchLetter[letter];
}

// Generates a MUS tree where the expression 'expr' is repeated 'count' times.
//
// This function will be used to "unfold" 'repeat' expressions, at the
// 'compile' function.
var repeatExpression = function(expr, count) {
    if(count == 0) {
        // behaving well with extreme cases...
        return { tag: 'rest', dur: 0 }
    } else if(count == 1) {
        return expr;
    } else {
        return {
            tag: 'seq',
            left: expr,
            right: repeatExpression(expr, count - 1)
        };
    } 
}


// Compiles 'musexpr', which is a Abstract Syntax Tree for the MUS language,
// into a NOTE program.
//
// Supports 'note', 'seq', 'par', 'rest' and 'repeat'  expressions.
var compile = function(musexpr, initial_time) {
    initial_time = typeof initial_time !== 'undefined' ? initial_time : 0;
    var build = [];

    // Recursively traverses a MUS AST, adding notes to the 'build' array.
    var traverse = function(expr, time) {
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
                traverse(expr.left, time);
                traverse(expr.right, endTime(time, expr.left));
                break;
            case 'par':
                traverse(expr.left, time);
                traverse(expr.right, time);
                break;
            case 'repeat':
                sequence = repeatExpression(expr.section, expr.count);
                build = build.concat(compile(sequence, time));
                break;
        }
    };
    
    traverse(musexpr, initial_time);
    return build;
};

exports.compile = compile;
