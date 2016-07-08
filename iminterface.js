var t = require('tcomb');
var Immutable = require('immutable');

function getDescription(props) {
  var description = {};
  Object.keys(props).forEach(function (k) {
    description[k] = null;
  });
  return description;
}

function iminterface(props, options) {

  var Type = t.interface(props, options);
  var Record = new Immutable.Record(getDescription(props), Type.meta.name);

  function ImInterface(value, path) {
    if (ImInterface.is(value)) {
      return value;
    }
    if (!(this instanceof ImInterface)) {
      return new ImInterface(value, path);
    }
    if (process.env.NODE_ENV !== 'production') {
      if (value instanceof Immutable.Map) {
        value = value.toObject();
      }
      return Record.call(this, Type(value, path));
    }
    return Record.call(this, value);
  }

  ImInterface.prototype = Object.create(Record.prototype);
  ImInterface.prototype.constructor = ImInterface;

  ImInterface.prototype.set = function () {
    return new ImInterface(Record.prototype.set.apply(this, Array.prototype.slice.call(arguments)));
  };

  ImInterface.meta = {
    kind: 'iminterface',
    props: props,
    name: Type.meta.name,
    identity: false,
    strict: Type.meta.strict
  };

  ImInterface.displayName = 'ImInterface' + Type.displayName;

  ImInterface.is = function (x) {
    return x instanceof ImInterface;
  };

  // Guard against a common mistake. Immutable does not map records in
  // the way that you expect: https://github.com/facebook/immutable-js/issues/645
  ImInterface.prototype.map = function() {
    throw new Error(
      'You should not be mapping a record; immutable does not support this'
    );
  };

  return ImInterface;
}

module.exports = iminterface;