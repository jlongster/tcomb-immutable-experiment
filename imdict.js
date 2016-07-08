var t = require('tcomb');
var Immutable = require('immutable');

function imdict(domain, codomain, name) {

  var Type = t.dict(domain, codomain, name);

  function ImDict(value, path) {
    if (ImDict.is(value)) {
      return value;
    }
    if (!(this instanceof ImDict)) {
      return new ImDict(value, path);
    }
    if (process.env.NODE_ENV !== 'production') {
      if (value instanceof Immutable.Map) {
        value = value.toObject();
      }
      return t.mixin(this, Immutable.Map(Type(value, path)), true);
    }
    return t.mixin(this, Immutable.Map(value), true);
  }

  ImDict.prototype = Object.create(Immutable.Map.prototype);
  ImDict.prototype.constructor = ImDict;

  // patch write methods
  [
    'delete',
    'clear',
    'update',
    'merge',
    'mergeWith',
    'mergeDeep',
    'mergeDeepWith',
    'set',
    'setIn',
    'deleteIn',
    'updateIn',
    'mergeIn',
    'mergeDeepIn',
    'withMutations'
  ].forEach(function (name) {
    ImDict.prototype[name] = function () {
      return new ImDict(Immutable.Map.prototype[name].apply(this, Array.prototype.slice.call(arguments)));
    };
  });

  ImDict.prototype.toString = function () {
    return '(ImDict) ' + Immutable.Map.prototype.toString.call(this);
  };

  ImDict.meta = {
    kind: 'imdict',
    domain: Type.meta.domain,
    codomain: Type.meta.codomain,
    name: Type.meta.name,
    identity: false
  };

  ImDict.displayName = 'ImDict' + Type.displayName;

  ImDict.is = function (x) {
    return x instanceof ImDict;
  };

  return ImDict;
}

module.exports = imdict;
