var assert = require('tcomb/lib/assert');
var isTypeName = require('tcomb/lib/isTypeName');
var isFunction = require('tcomb/lib/isFunction');
var getTypeName = require('tcomb/lib/getTypeName');
var isIdentity = require('tcomb/lib/isIdentity');
var create = require('tcomb/lib/create');
var is = require('tcomb/lib/is');
var isArray = require('tcomb/lib/isArray');
var Immutable = require('immutable');

function getDefaultName(type) {
  return 'ImList<' + getTypeName(type) + '>';
}

function imlist(type, name) {

  if (process.env.NODE_ENV !== 'production') {
    assert(isFunction(type), function () { return 'Invalid argument type ' + assert.stringify(type) + ' supplied to list(type, [name]) combinator (expected a type)'; });
    assert(isTypeName(name), function () { return 'Invalid argument name ' + assert.stringify(name) + ' supplied to list(type, [name]) combinator (expected a string)'; });
  }

  var displayName = name || getDefaultName(type);
  var typeNameCache = getTypeName(type);
  var identity = isIdentity(type);

  function TypedList(value) {
    Immutable.List.call(this, value);
  }

  TypedList.__coerce = function(list) {
    const l = new TypedList();
    l.size = list.size;
    l._origin = list._origin;
    l._capacity = list._capacity;
    l._level = list._level;
    l._root = list._root;
    l._tail = list._tail;
    l.__ownerID = list.__ownerID;
    l.__hash = list.__hash;
    l.__altered = list.__altered;
    return l;
  };

  TypedList.prototype = Object.create(Immutable.List.prototype);

  TypedList.prototype.set = function(index, value) {
    return TypedList.__coerce(Immutable.List.prototype.set.call(
      this,
      index,
      create(type, value, ( process.env.NODE_ENV !== 'production' ? [displayName].concat(index + ': ' + typeNameCache) : null ))
    ));
  };

  TypedList.prototype.asMutable = function() {
    return TypedList.__coerce(Immutable.List.prototype.asMutable.call(this));
  };

  function ImList(value, path) {

    if (process.env.NODE_ENV === 'production') {
      if (identity) {
        return (value instanceof Immutable.List) ? value : Immutable.List(value);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      path = path || [displayName];
      assert(isArray(value) || (value instanceof Immutable.List), function () { return 'Invalid value ' + assert.stringify(value) + ' supplied to ' + path.join('/') + ' (expected an array of ' + typeNameCache + ')'; });
    }

    var idempotent = true;
    var ret = [];
    var arr = (value instanceof Immutable.List) ? value.toArray() : value;

    for (var i = 0, len = arr.length; i < len; i++ ) {
      var actual = arr[i];
      var instance = create(type, actual, ( process.env.NODE_ENV !== 'production' ? path.concat(i + ': ' + typeNameCache) : null ));
      idempotent = idempotent && ( actual === instance );
      ret.push(instance);
    }

    if (idempotent && value instanceof Immutable.List) { // implements idempotency
      return value;
    }

    return TypedList.__coerce(Immutable.List(ret));
  }

  ImList.meta = {
    kind: 'imlist',
    type: type,
    name: name,
    identity: identity
  };

  ImList.displayName = displayName;

  ImList.is = function (x) {
    if(!x instanceof Immutable.List) {
      return false;
    }

    return x.every(e => is(e, type));
  };

  return ImList;
}

imlist.getDefaultName = getDefaultName;
module.exports = imlist;
