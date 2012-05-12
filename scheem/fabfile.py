
from fabric.api import local

def make_parser():
    local("pegjs -e SCHEEM scheem.peg parser.js")

def test(bail=False):
    local("mocha -u tdd -R list" + (" -b" if bail else ""))
