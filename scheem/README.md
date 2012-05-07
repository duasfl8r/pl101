# Requirements

* [NodeJS](http://nodejs.org) to run JS files
    * [PEGJS](http://pegjs.majda.cz) for the parser
    * [Mocha](http://visionmedia.github.com/mocha) and
      [Chai](http://chaijs.com) to run unit tests

* [Fabric](http://fabfile.org) to run fab scripts.

# Testing

To start unit tests, run `fab test`. This will run all Mocha tests
on the command line.

To run the web version of the tests, you should run 'fab make_parser' to
generate a `parser.js` file, and then open `tests/webtest.html` on your
browser. 
