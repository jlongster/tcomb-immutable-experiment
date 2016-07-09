var t = require('tcomb');
var Immutable = require('immutable');

function getDescription(props, defaultProps) {
  var description = {};
  Object.keys(props).forEach(function (k) {
    description[k] = defaultProps[k];
  });
  return description;
}

function iminterface(props, options) {

  var Type = t.interface(props, options);
  var defaultProps = Type.meta.defaultProps || {};
  var Record = new Immutable.Record(getDescription(props, defaultProps), Type.meta.name);
  var displayName = Type.displayName;

  function ImInterface(value, path) {
    return new Record(Type(value instanceof Immutable.Map ? value.toObject() : value, path));
  }

  // if (!Type.meta.identity) { // <= think twice about this...
    var set = Record.prototype.set;
    Record.prototype.set = function (k, v) {
      return set.call(this, k, props[k](v, [displayName, k + ': ' + props[k].displayName]));
    };

    var remove = Record.prototype.remove;
    Record.prototype.remove = function (k) {
      return remove.call(this, props[k](defaultProps[k], [displayName, k + ': ' + props[k].displayName]));
    };
  // }

  // Guard against a common mistake. Immutable does not map records in
  // the way that you expect: https://github.com/facebook/immutable-js/issues/645
  Record.prototype.map = function() {
    throw new Error(
      'You should not be mapping a record; immutable does not support this'
    );
  };

  ImInterface.meta = {
    kind: 'iminterface',
    props: props,
    name: Type.meta.name,
    identity: false,
    strict: Type.meta.strict
  };

  ImInterface.displayName = displayName;

  ImInterface.is = function (x) {
    return x instanceof Record;
  };

  return ImInterface;
}

module.exports = iminterface;