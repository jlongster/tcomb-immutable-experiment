const t = require("tcomb");
const imstruct = require("./imstruct");
const imlist = require("./imlist");
const imdict = require("./imdict");

// Change ANY of the data passed in to the type constructors and you
// will see nice errors.

const Person = imstruct({
  name: t.String,
  age: t.Number
});

console.log(Person({ name: "James", age: 15 }))

const People = imlist(Person);

console.log(People([{ name: "James", age: 15 },
                    { name: "Georgia", age: 1 }]));

const ByName = imdict(t.String, Person);

console.log(ByName({
  "James": { name: "James", age: 15 },
  "Georgia": { name: "Georgia", age: 1 }
}));

const MorePeople = imstruct({
  people: imdict(t.String, Person),
  areFun: t.Boolean
});

const people = MorePeople({
  people: { "James": { name: "James", age: 15 }},
  areFun: true
});

console.log(people.setIn(
  ["people", "bar"],
  { name: "Georgia", age: 1 }
));
