var assert = require('tcomb/lib/assert');
var isTypeName = require('tcomb/lib/isTypeName');
var isFunction = require('tcomb/lib/isFunction');
var getTypeName = require('tcomb/lib/getTypeName');
var isIdentity = require('tcomb/lib/isIdentity');
var isObject = require('tcomb/lib/isObject');
var create = require('tcomb/lib/create');
var is = require('tcomb/lib/is');
var Immutable = require('immutable');

function getDefaultName(domain, codomain) {
  return 'ImDict {[key: ' + getTypeName(domain) + ']: ' + getTypeName(codomain) + '}';
}

function imdict(domain, codomain, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isFunction(domain), function () { return 'Invalid argument domain ' + assert.stringify(domain) + ' supplied to imdict(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isFunction(codomain), function () { return 'Invalid argument codomain ' + assert.stringify(codomain) + ' supplied to imdict(domain, codomain, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to imdict(domain, codomain, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(domain, codomain);
  var domainNameCache = getTypeName(domain);
  var codomainNameCache = getTypeName(codomain);
  var identity = isIdentity(domain) && isIdentity(codomain);

  function TypedMap(value) {
    Immutable.Map.call(this, value);
  }

  TypedMap.__coerce = function(map) {
    // This is an optimization for coercing an Immutable.Map into a
    // TypedMap, only used to force all return values of a TypedMap to
    // be a TypedMap. WARNING: You should never use this on an
    // Immutable.Map that is referenced elsewhere.
    const m = new TypedMap();
    m.size = map.size;
    m._root = map._root;
    m.__hash = map.__hash;
    m.__altered = map.__altered;
    m.__ownerID = map.__ownerID;
    return m;
  };

  TypedMap.prototype = Object.create(Immutable.Map.prototype);

  TypedMap.prototype.set = function (key, val) {
    return TypedMap.__coerce(Immutable.Map.prototype.set.call(
      this,
      key,
      create(
        codomain,
        val,
        ( process.env.NODE_ENV !== 'production' ? [displayName].concat(key + ': ' + codomainNameCache) : null )
      )
    ));
  };

  TypedMap.prototype.asMutable = function () {
    return TypedMap.__coerce(Immutable.Map.prototype.asMutable.call(this));
  };

  // We need to override these 4 merge functions because they convert
  // all of the arguments to immutable objects with `fromJS`. We don't
  // want that because we want to interoperate with other types, which
  // expect native JS objects in constructors. This allows you to use
  // the nice `merge` functions but control what is converted to
  // immutable or not.

  TypedMap.prototype.merge = function () {
    const args = this.__forceIterables(Array.prototype.slice.call(arguments));
    return TypedMap.__coerce(Immutable.Map.prototype.merge.apply(this, args));
  };

  TypedMap.prototype.mergeWith = function (merger) {
    const args = this.__forceIterables(Array.prototype.slice.call(arguments, 1));
    args.unshift(merger);
    return TypedMap.__coerce(Immutable.Map.prototype.mergeWith.apply(this, args));
  };

  TypedMap.prototype.mergeDeep = function () {
    const args = this.__forceIterables(Array.prototype.slice.call(arguments));
    return TypedMap.__coerce(Immutable.Map.prototype.mergeDeep.apply(this, args));
  };

  TypedMap.prototype.mergeDeepWith = function (merger) {
    const args = this.__forceIterables(Array.prototype.slice.call(arguments, 1));
    args.unshift(merger);
    return TypedMap.__coerce(Immutable.Map.prototype.mergeDeepWith.apply(this, args));
  };

  TypedMap.prototype.__forceIterables = function(args) {
    // This forces all arguments into an iterable, which makes all the
    // merge functions avoid calling `fromJS` and converting them
    // deeply into immutable objects.
    const iters = [];
    for(var i=0; i<args.length; i++) {
      if(!Immutable.Iterable.isIterable(args[i])) {
        iters.push(Immutable.Iterable(args[i]));
      }
      else {
        iters.push(args[i]);
      }
    }
    return iters;
  };

  function ImDict(value, path) {

    if (process.env.NODE_ENV === 'production') {
      if (identity) {
        return (value instanceof Immutable.Map) ? value : Immutable.Map(value);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      path = path || [displayName];
      assert(isObject(value) || (value instanceof Immutable.Map), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/'); });
    }

    var idempotent = true;
    var ret = {};
    var obj = (value instanceof Immutable.Map) ? value.toObject() : value;

    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        k = create(domain, k, ( process.env.NODE_ENV !== 'production' ? path.concat(domainNameCache) : null ));
        var actual = obj[k];
        var instance = create(codomain, actual, ( process.env.NODE_ENV !== 'production' ? path.concat(k + ': ' + codomainNameCache) : null ));
        idempotent = idempotent && ( actual === instance );
        ret[k] = instance;
      }
    }

    if (idempotent && value instanceof TypedMap) { // implements idempotency
      return value;
    }

    return TypedMap.__coerce(Immutable.Map(ret));
  }

  ImDict.meta = {
    kind: 'imdict',
    domain: domain,
    codomain: codomain,
    name: name,
    identity: identity
  };

  ImDict.displayName = displayName;

  ImDict.is = function (x) {
    if (!(x instanceof Immutable.Map)) {
      return false;
    }

    return x.every((v, k) => {
      return is(k, domain) && !is(x[k], codomain);
    });
  };

  return ImDict;
}

imdict.getDefaultName = getDefaultName;
module.exports = imdict;
