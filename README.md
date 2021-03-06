
# tcomb-immutable-experiment

This is an experiment for [immutable-js](https://github.com/facebook/immutable-js/)-backed [tcomb](https://github.com/gcanti/tcomb) types.

tcomb provides a nice way to specify runtime types, especially for data. You can use to define types across arbitrary data structures and it will sure that it always matches those types.

By default, it only works with native JS objects. We are using immutable.js though, so we wanted to type the as well.

I copied most of the implementations of list, dict, and struct and converted them to immutable types (hence differing code styles). This is where I ended up.

Typing both immutable and non-immutable data gives huge clarity in the whole system. It's easy to see which objects are immutable or not, and the types know how to hydrate/dehydrate data. You'll never need `fromJS` again, because the type will automatically convert things to immutable when needed.

See [usage.js](https://github.com/jlongster/tcomb-immutable-experiment/blob/master/usage.js) for usage examples.

## imdict

Defines a dictionary type, analagous to the [t.dict](https://github.com/gcanti/tcomb/blob/master/docs/API.md#the-dict-combinator) combinator.

## iminterface

Defines an immutable struct type (similar to Immutable.Record), analagous to the [t.interface](https://github.com/gcanti/tcomb/blob/master/docs/API.md#the-interface-combinator) combinator.

## imlist

Defines an immutable list, analagous to the [t.list](https://github.com/gcanti/tcomb/blob/master/docs/API.md#the-list-combinator) combinator.