/*
  loadware.js - middleware handling
  Normalizes a varied group of middleware descriptors into an array of middleware.
  loadware(['body-parser', [() => {}], ['cookie-parser', { session: () => {} }]]) =>
    [() => {}, () => {}, () => {}, () => {}]
*/

let isObject = obj => obj.toString() === '[object Object]';

// Retrieve the first key of an object
let getKey = obj => isObject(obj) ? Object.keys(obj)[0] : false;

// Retrieve the first value of an object
let getValue = obj => obj[getKey(obj)];

// Put it all into a single array of non-arrays recursively
// ['a', ['b', ['c', ...]]] => ['a', 'b', 'c', ...]
let flat = middle => {
  while (middle.filter(mid => mid instanceof Array).length) {
    middle = middle.reduce((all, arg) => all.concat(arg), []);
  }
  return middle;
}


// Expand a complex object into several simple ones
// [{ a: 'a', b: 'b', c: 'c' }] => [{ a: 'a' }, { b: 'b' }, { c: 'c' }]
let expand = middle => {
  middle = middle.map(mid => {
    if (!isObject(mid)) return mid;

    let arr = [];
    for (let key in mid) {
      arr.push({ [key]: mid[key] });
    }
    return arr;
  });
  return flat(middle);
};





// Get them all together in a single object
let join = (obj, one) => Object.assign({}, obj, one);

// Retrieve an object with the last known config
let retrieveObjs = middle => middle.filter(isObject).reduce(join, {});





// Keep only the last copy for a named middleware
let removeDups = (middle, objs) => middle.map(getKey)

  // Flag which objects to remove
  .map((key, i, all) => !key || all.lastIndexOf(key) === i)

  // Map the good copies to the original value
  .map((good, i) => good && middle[i])

  // Defined && not an object || defined && a non-empty object
  .filter(mid => mid && (!getKey(mid) || getValue(mid)));





module.exports = (...middle) => {

  // Make it into a non-null list of functions
  middle = flat(middle);

  // Put object with several keys into different objects
  // [{ a: 'a', b: 'b' }, { c: 'c' }] => [{ a: 'a' }, { b: 'b' }, { c: 'c' }]
  middle = expand(middle);

  // Get an object with each of the named middlewares
  // [{ a: 'a' }, { b: 'b' }, { a: 'c' }] => [{ a: 'c', b: 'b' }]
  let objs = retrieveObjs(middle);

  // Remove duplicated, previous objects
  // [{ a: 'a' }, { b: 'b' }, { a: 'c' }] => [{ b: 'b' }, { a: 'c' }]
  middle = removeDups(middle, objs);

  // Finally keep only the callback
  // [{ b: 'b' }, { a: 'c' }] => ['b', 'c']
  middle = middle.map(mid => isObject(mid) ? getValue(mid) : mid);

  // Include from string
  // ['a', 'b'] => [require('a'), require('b')]
  middle = middle.map(mid => typeof mid === 'string' ? require(mid) : mid);

  return middle;
};
