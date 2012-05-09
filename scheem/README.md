# Scheem interpreter

## Requirements

* [NodeJS](http://nodejs.org) to run JS files
    * [PEGJS](http://pegjs.majda.cz) for the parser
    * [Mocha](http://visionmedia.github.com/mocha) and
      [Chai](http://chaijs.com) to run unit tests

* [Fabric](http://fabfile.org) to run fab scripts.

## Language

Scheem is a language that smells a lot like Scheme.

A program is one (and only one) s-expression:

~~~
;; sums two numbers
(begin
    (define x 10)   ;; defining x value
    (define y 20)   ;; defining y value
    (+ x y))
~~~

A comment starts with `;;` and goes until the end of the line.

### Supported features

**Literals**: number (`192`, `1`, -`10`, `1000.4`); boolean (`#f` is false, anything
else -- including `#t` -- is true).

**Arithmetics**: `(+ 1 2 3 4)`, `(- 15 5)`, `(* 2 5)`, `(/ 40 2 2)` all give
the same **result**: `10`.

**Variables**: `(define x 10)` defines `x` as `10` for the first time; `(set! x
15)` sets `x` to `15` after it was defined.

**Blocks**: although a Scheem program contains only one s-expression, you
can nest multiple sub-expressions inside a `begin`. They will be executed
sequentially, and will return whatever the last executed expression
returns.

**Quoting**: when you quote a s-expression, its contents are not
evaluated; it is returned as data. Thus, `(quote (+ 2 3))` returns the list
`(+ 2 3)`, not `5`. You can abbreviate `quote` to a single quote: `'(1 2 3)`

**Comparisons**: Scheem currently supports `<` and `=` as comparisons
between numbers.

**Lists**: `(cons head tail)` puts `head` in the beginning of `tail` (which
must be a list). `(car list)` returns the first element of `list`, while
`(cdr list)` returns *all but* the first element of `list`.

**If-then-else**: `(if condition then else)` evaluates `condition`. If it's
true, `then` is evaluated. If it's false, `else` is evaluated.

## Testing

To start unit tests, run `fab test`. This will run all Mocha tests
on the command line.

To run the web version of the tests, you should run 'fab make_parser' to
generate a `parser.js` file, and then open `tests/webtest.html` on your
browser. 
