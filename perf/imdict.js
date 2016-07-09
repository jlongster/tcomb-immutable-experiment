var Benchmark = require('benchmark');
var Immutable = require('immutable');
var t = require('tcomb');
var imdict = require('../lib/imdict');

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

var vanillaMap = Immutable.Map({});

function VanillaTest() {
  vanillaMap.set('a', counter++);
}

//
// imdict
//

var ImDict = imdict(t.String, t.Number);
var dict = ImDict({});

function ImDictTest() {
  dict.set('a', counter++);
}

// process.env.NODE_ENV = 'production';
Benchmark.Suite({ })
  .add('VanillaTest', VanillaTest)
  .add('ImDictTest', ImDictTest)
  .on('complete', onComplete)
  .run({ async: true });
