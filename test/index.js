/* globals describe, it */
var assert = require('assert');
var t = require('tcomb');
var iminterface = require('../lib/iminterface');
var imlist = require('../lib/imlist');
var imdict = require('../lib/imdict');

function throwsWithMessage(f, message) {
  assert.throws(f, function (err) {
    assert.strictEqual(err instanceof Error, true);
    assert.strictEqual(err.message, message);
    return true;
  });
}

var Tags = t.struct({
  tag1: t.String
});

var Person = iminterface({
  name: t.String,
  age: t.Number,
  tags: t.maybe(Tags)
}, { strict: true, name: 'Person' });

var People = imlist(Person, 'People');

var ByName = imdict(t.String, Person);

describe('iminterface', function () {

  var value = { name: "James", age: 15 };
  var person = Person(value);

  it('should throw if a bad value is used', function () {
    throwsWithMessage(function () {
      Person({});
    }, '[tcomb] Invalid value undefined supplied to Person/name: String');
  });

  it('should handle the name option', function () {
    var A = iminterface({}, 'A');
    assert.strictEqual(A.meta.name, 'A');
    assert.strictEqual(A.displayName, 'A');
  });

  it('should handle the is function', function () {
    assert.strictEqual(Person.is(person), true);
    assert.strictEqual(Person.is(value), false);
  });

  it('should handle the strict option', function () {
    throwsWithMessage(function () {
      Person({ name: "James", age: 15, a: 1 });
    }, '[tcomb] Invalid additional prop "a" supplied to Person');
  });

  it('should handle sub types', function () {
    var person = Person({ name: "James", age: 15, tags: { tag1: 'aaa' } });
    assert.strictEqual(Tags.is(person.tags), true);
    assert.strictEqual(Tags.is(person.set('tags', { tag1: 'bbb' }).tags), true);
  });

  it('should type check the set method', function () {
    assert.strictEqual(typeof person.set, 'function');
    throwsWithMessage(function () {
      person.set('name', 1);
    }, '[tcomb] Invalid value 1 supplied to Person/name: String');
    throwsWithMessage(function () {
      person.set('name', 'Giulio').set('name', 2);
    }, '[tcomb] Invalid value 2 supplied to Person/name: String');
  });

  it('should type check the remove method', function () {
    assert.strictEqual(typeof person.remove, 'function');
    throwsWithMessage(function () {
      person.remove('name');
    }, '[tcomb] Invalid value undefined supplied to Person/name: String');
  });

  it('should throw if map method is used', function () {
    assert.strictEqual(typeof person.set, 'function');
    throwsWithMessage(function () {
      person.map();
    }, 'You should not be mapping a record; immutable does not support this');
  });

});

describe('imlist', function () {

  var values = [
    { name: "James", age: 15 },
    { name: "Georgia", age: 1 }
  ];
  var people = People(values);

  it('should throw if a bad value is used', function () {
    throwsWithMessage(function () {
      People(1);
    }, '[tcomb] Invalid value 1 supplied to People (expected an array of Person)');
  });

  it('should handle the name option', function () {
    var A = imlist(Person, 'A');
    assert.strictEqual(A.meta.name, 'A');
    assert.strictEqual(A.displayName, 'A');
  });

  it('should handle the is function', function () {
    assert.strictEqual(People.is(people), true);
    assert.strictEqual(People.is(values), false);
  });

  it('should type check the set method', function () {
    assert.strictEqual(typeof people.set, 'function');
    throwsWithMessage(function () {
      people.set(0, { name: 1, age: 43 });
    }, '[tcomb] Invalid value 1 supplied to People/0: Person/name: String');
  });

  it('should type check the push method', function () {
    assert.strictEqual(typeof people.push, 'function');
    throwsWithMessage(function () {
      people.push({ name: 1, age: 43 });
    }, '[tcomb] Invalid value 1 supplied to People/0: Person/name: String');
  });

});

describe('imdict', function () {

  var values = {
    "James": { name: "James", age: 15 },
    "Georgia": { name: "Georgia", age: 1 }
  };
  var people = ByName(values);

  it('should throw if a bad value is used', function () {
    throwsWithMessage(function () {
      ByName(1);
    }, '[tcomb] Invalid value 1 supplied to {[key: String]: Person}');
  });

  it('should handle the name option', function () {
    var A = imdict(t.String, Person, 'A');
    assert.strictEqual(A.meta.name, 'A');
    assert.strictEqual(A.displayName, 'A');
  });

  it('should handle the is function', function () {
    assert.strictEqual(ByName.is(people), true);
    assert.strictEqual(ByName.is(values), false);
  });

  it('should type check the set method', function () {
    assert.strictEqual(typeof people.set, 'function');
    throwsWithMessage(function () {
      people.set('Giulio', { name: 1, age: 43 });
    }, '[tcomb] Invalid value 1 supplied to {[key: String]: Person}/Giulio: Person/name: String');
  });

});