var fs          = require('fs'),
    db          = require('diskdb'),
    _           = require('lodash'),
    async       = require('async'),
    path        = require('path'),
    storage     = db.connect(__dirname + '/contents', ['records']),
    mkdirp      = require('mkdirp'),
    tokenize    = require('talisman/tokenizers/words/treebank').default,
    stem        = require('talisman/stemmers/uea-lite').default,
    stopwords   = require('./stopwords/en');


// console.log()
var total = db.records.count();

var q = async.queue(function(filepath, nextFile) {
  console.log('remaining: ', q.length(),'/', total);
    
  async.waterfall([
    function getContents(next) {
      console.log('-- reading file: ', filepath)
      fs.readFile(filepath, {encoding: 'utf8'}, next);
    },
    
    function(contents, next) {
      console.log('-- stemming file: ', filepath);

      var stems = _(tokenize(contents))
      	  .map(d => d.toLowerCase().replace(/\d/g,'')) // clean from numbers and lowercase text
          //.map(d => d.replace(/\d/g,'')) // clean from numbers without lowercasing text
          .map(d => d.replace(/[\d\.:\/,;\?\!<>@`'"]/g, '').trim()) // clean from digits
          .compact() // remove empty strings

          .map(d => stem(d)) // stem remaining
          
          .filter(d => stopwords.indexOf(d.toLowerCase()) == -1) // remove stopwords
          .filter(d => d.length > 1)// filter on word length
          
          .value();
      
      next(null, stems)
      // next(null, contents);
    },

    function(contents, next) {
      var outdir = path.join(path.dirname(filepath), 'stems'),
          outpath = path.join(outdir, path.basename(filepath) + '.stemmed.txt');
      // create if it does not exists

      console.log('-- storing stanfordNER responses in: ', outpath + '.NER.json');
      mkdirp(outdir, function (err) {
        if (err)
          next(err);
        else
          fs.writeFile(outpath, contents, next);
      });
    }
  ], function(err) {
    if(err) {
      q.kill();
      console.error(err)
    }
    nextFile();
  });

  
}, 3);

q.push(_(db.records.find())
  .map('src') // get just the src part
  // .take(5) // uncomment for testing
  .value())
q.drain = function() {
  console.log('oh, yeh');
}