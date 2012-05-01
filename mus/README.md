# MUS language

## Syntax

### Comments

A comment starts with `;;` and go until the end of the line.

### Notes and rests

A A4 note with 100ms of duration is written this way:

`a4 100`

The letter part of the pitch is case-insensitive (i.e. `A4 100` is equally
valid).

You can specify a **default duration** for all following notes in a block:

```
* 100
    a4
    a4
    b5 250
```

This sets the duration of 100ms for all the indented notes if they have
none.

When a default duration is set, you can also refer to notes durations in a
relative way:

```
* 100
    a4 /2
    a4 x4
```

The first note will play for 50ms, while the second will play for 400ms.

A rest (a period of silence) is written with two dashes:

`-- 200`

Its duration follows the same rules than notes.

### Sequences and harmonies

A sequence of notes is written simply by putting one note after another,
separated by newlines:

```
a4 100
b4 100
g4 200
```

A harmony -- two or more sequences played in parallel -- starts with the
equal symbol `=`, followed by a indented block.

```
* 100
    a4
    b4
    c4 /2
    g4 250
    -- x4

=
    a4
    b4 /2
    &
    a2
    b5 /2
    &
    a6
    g4 /2

3*
    =
        a4 100
        &
        a5 150
        &
        a6 200


```



* Notes
* Rest
* Sequences
* Parallel
* Repetition
