var Benchmark = require('benchmark');
var Immutable = require('immutable');
var t = require('tcomb');
var imlist = require('../lib/imlist');

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

var vanillaList = Immutable.List([]);

function VanillaTest() {
  vanillaList.set(0, counter++);
}

//
// imlist
//

var ImList = imlist(t.Number);
var list = ImList([]);

function ImListTest() {
  list.set(0, counter++);
}

// process.env.NODE_ENV = 'production';
Benchmark.Suite({ })
  .add('VanillaTest', VanillaTest)
  .add('ImListTest', ImListTest)
  .on('complete', onComplete)
  .run({ async: true });
