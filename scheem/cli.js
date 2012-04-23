scheem = require('./scheem.js');
fs = require('fs');

if(process.argv.length != 3) {
    console.error("Usage: node %s <program>", process.argv[1]);
    process.exit(-1);
}

try {
    var program = fs.readFileSync(process.argv[2], 'utf-8');
    console.log(scheem.parse(program));
} catch(err) {
    console.error("ERROR:", err);
}
