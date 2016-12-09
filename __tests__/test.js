let expect = require('chai').expect;
let pray = require('pray');
let loadware = require('../loadware');

pray.isFn = (el) => expect(el instanceof Function).to.equal(true, el + 'is not a function');
let allFn = arr => arr.forEach(pray.isFn);

describe('loadware.js', function() {

  it('Can be used empty', () => {
    pray([])(loadware());
  });

  it('Can load from a string', () => {
   pray(allFn)(loadware('./tests/loadware/a'));
  });

  it('Converts function to array', () => {
    let demo = function(){};
    pray([demo])(loadware(demo));
  });

  it('Joins objects with the same key', () => {
    pray(allFn)(loadware({ a: './tests/loadware/a', b: './tests/loadware/b' }, { a: './tests/loadware/c' }));
  });

  it('Can load several objects and they overwrite each other where appropriate', () => {
    let fn = function(){};
    let loaded = loadware({ a: './tests/loadware/a', b: './tests/loadware/b' }, { c: './tests/loadware/c' }, fn, { b: false });
    pray(allFn)(loaded);
    expect(loaded.length).to.equal(3);
  });

  // When passing Router() it only rendered the last one since it had some properties
  it('Treats a function as a function even if it has properties', () => {
    let fnA = function(){};
    let fnB = function(){};
    fnA.a = 'a';
    fnB.a = 'b';
    expect(loadware([fnA, fnB]).length).to.equal(2);
  });

  it('Default stays the same', () => {
    pray(allFn)(loadware([{ hi: './tests/loadware/a' }]));
  });
});
