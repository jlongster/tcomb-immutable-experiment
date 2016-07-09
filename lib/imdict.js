var t = require('tcomb');
var Map = require('immutable').Map;

function imdict(domain, codomain, name) {

  var Type = t.dict(domain, codomain, name);
  var displayName = Type.displayName;

  function set(k, value) {
    return patch(Map.prototype.set.call(this, domain(k, [displayName, k + ': ' + domain.displayName]), codomain(value, [displayName, k + ': ' + codomain.displayName])));
  }

  // other methods here...

  function patch(map) {
    // if (!domain.meta.identity || !codomain.meta.identity) { // <= think twice about this...
      map.set = set;
      // other methods here...
    // }
    return map;
  }

  function ImDict(value, path) {
    return patch(Map(Type(value instanceof Map ? value.toObject() : value, path)));
  }

  ImDict.meta = {
    kind: 'imdict',
    domain: Type.meta.domain,
    codomain: Type.meta.codomain,
    name: Type.meta.name,
    identity: false
  };

  ImDict.displayName = displayName;

  ImDict.is = function (x) {
    if (!(x instanceof Map)) {
      return false;
    }
    return x.every(function (v, k) {
      return domain.is(k) && codomain.is(v);
    });
  };

  return ImDict;
}

module.exports = imdict;
