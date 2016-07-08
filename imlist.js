var t = require('tcomb');
var Immutable = require('immutable');

function imlist(type, name) {

  var Type = t.list(type, name);

  function ImList(value, path) {
    if (ImList.is(value)) {
      return value;
    }
    if (!(this instanceof ImList)) {
      return new ImList(value, path);
    }
    if (process.env.NODE_ENV !== 'production') {
      if (value instanceof Immutable.List) {
        value = value.toArray();
      }
      return t.mixin(this, Immutable.List(Type(value, path)), true);
    }
    return t.mixin(this, Immutable.List(value), true);
  }

  ImList.prototype = Object.create(Immutable.List.prototype);
  ImList.prototype.constructor = ImList;

  // patch write methods
  [
    'set',
    'delete',
    'insert',
    'clear',
    'push',
    'pop',
    'unshift',
    'shift',
    'update',
    'merge',
    'mergeWith',
    'mergeDeep',
    'mergeDeepWith',
    'setSize',
    'setIn',
    'deleteIn',
    'updateIn',
    'mergeIn',
    'mergeDeepIn',
    'withMutations'
  ].forEach(function (name) {
    ImList.prototype[name] = function () {
      return new ImList(Immutable.List.prototype[name].apply(this, Array.prototype.slice.call(arguments)));
    };
  });

  ImList.prototype.toString = function () {
    return '(ImList) ' + Immutable.List.prototype.toString.call(this);
  };

  ImList.meta = {
    kind: 'imlist',
    type: type,
    name: Type.meta.name,
    identity: false
  };

  ImList.displayName = 'ImList' + Type.displayName;

  ImList.is = function (x) {
    return x instanceof ImList;
  };

  return ImList;
}

module.exports = imlist;
