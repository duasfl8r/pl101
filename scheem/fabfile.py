
from fabric.api import local

def make_parser():
    local("pegjs -e SCHEEM scheem.peg parser.js")

def test():
    local("mocha -u tdd -R list")
