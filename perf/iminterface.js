var Benchmark = require('benchmark');
var Immutable = require('immutable');
var t = require('tcomb');
var iminterface = require('../lib/iminterface');

function getHz(bench) {
  var result = 1 / (bench.stats.mean + bench.stats.moe);
  return isFinite(result) ? result : 0;
}

function onComplete() {
  this.forEach(function (bench) {
    console.log(bench.name + ' ' + getHz(bench) + ' ops/sec'); // eslint-disable-line no-console
  });
}

var counter = 0;

//
// vanilla
//

var VanillaRecord = Immutable.Record({ age: null });
var vanillaRecord = VanillaRecord({ age: 0 });

function VanillaTest() {
  vanillaRecord.set('age', counter++);
}

//
// iminterface
//

var ImInterface = iminterface({ age: t.Number });
var record = ImInterface({ age: 0 });

function ImInterfaceTest() {
  record.set('age', counter++);
}

// process.env.NODE_ENV = 'production';
Benchmark.Suite({ })
  .add('VanillaTest', VanillaTest)
  .add('ImInterfaceTest', ImInterfaceTest)
  .on('complete', onComplete)
  .run({ async: true });
