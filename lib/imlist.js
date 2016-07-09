var t = require('tcomb');
var List = require('immutable').List;

function imlist(type, name) {

  var Type = t.list(type, name);
  var displayName = Type.displayName;

  function set(index, value) {
    return patch(List.prototype.set.call(this, index, type(value, [displayName, index + ': ' + type.displayName])));
  }

  function push() {
    return patch(List.prototype.push.apply(this, Type(Array.prototype.slice.call(arguments), [displayName])));
  }

  // other methods here...

  function patch(list) {
    // if (!type.meta.identity) { // <= think twice about this...
      list.set = set;
      list.push = push;
      // other methods here...
    // }
    return list;
  }

  function ImList(value, path) {
    return patch(List(Type(value instanceof List ? value.toArray() : value, path)));
  }

  ImList.meta = {
    kind: 'imlist',
    type: type,
    name: Type.meta.name,
    identity: false
  };

  ImList.displayName = displayName;

  ImList.is = function (x) {
    if(!(x instanceof List)) {
      return false;
    }
    return x.every(type.is);
  };

  return ImList;
}

module.exports = imlist;
