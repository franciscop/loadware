let pray = require('pray');
let loadware = require('../loadware');

pray.isFn = (el) => expect(el instanceof Function).toBe(true);
let allFn = arr => arr.forEach(pray.isFn);

describe('loadware.js', function() {

  it('Can be used empty', () => {
    pray([])(loadware());
  });

  it('Can load from a string', () => {
   pray(allFn)(loadware('./tests/a'));
  });

  it('Converts function to array', () => {
    let demo = function(){};
    pray([demo])(loadware(demo));
  });

  it('Joins objects with the same key', () => {
    pray(allFn)(loadware({ a: './tests/a', b: './tests/b' }, { a: './tests/c' }));
  });

  it('Can load several objects and they overwrite each other where appropriate', () => {
    let fn = function(){};
    let loaded = loadware({ a: './tests/a', b: './tests/b' }, { c: './tests/c' }, fn, { b: false });
    pray(allFn)(loaded);
    expect(loaded).toHaveLength(3);
  });

  // When passing Router() it only rendered the last one since it had some properties
  it('Treats a function as a function even if it has properties', () => {
    let fnA = function(){};
    let fnB = function(){};
    fnA.a = 'a';
    fnB.a = 'b';
    expect(loadware([fnA, fnB])).toHaveLength(2);
  });

  it('Default stays the same', () => {
    pray(allFn)(loadware([{ hi: './tests/a' }]));
  });
});
