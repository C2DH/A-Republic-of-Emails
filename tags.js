"use strict"
/*
  Print out a proper csv. To be used after stanfordNER
*/
var fs          = require('fs'),
    db          = require('diskdb'),
    _           = require('lodash'),
    async       = require('async'),
    stringify   = require('csv-stringify'),

    storage     = db.connect(__dirname + '/contents', ['records']);



var total   = db.records.count(),
    rows = [];

var q = async.queue(function(record, nextRecord) {
  console.log('remaining: ', q.length(),'/', total);
  var filepath = record.src;

  async.waterfall([
    function getNERfile(next) {
      console.log('-- reading NER file: ', filepath +  '.NER.json');
      // get NER annotated file
      fs.readFile(filepath + '.NER.json', {encoding: 'utf8'}, next);
      // next(null, contents);
    },

    function collect(contents, next) {
      console.log('-- collecting tags: ', filepath);
      // get NER annotated file
      var ner = JSON.parse(contents);
      // console.log(ner.entities.LOCATION)
      rows.push(_.assign({
        locations: _.uniq(ner.entities.LOCATION).join(' | '),
        people: _.uniq(ner.entities.PERSON).join(' | ')
      }, record));

      next(null)
    },


  ], function(err) {
    if(err) {
      q.kill();
      console.error(err)
    }
    nextRecord();
  });

  
}, 3);

q.push(_(db.records.find())
  // .take(5) // uncomment for testing
  .value())
q.drain = function() {
  console.log('And we are done! ... writing csv ...');
  
  stringify(rows, {
    delimiter: ';',
    quoted: true,
    header: true,
    columns: ['url', 'src', 'data', 'From', 'To', 'Subject', 'Date', 'locations', 'people']
  }, function(_err, data) {
    if(_err){
      console.log('err', _err)
    } else {
      console.log('done!')
      fs.writeFile('./contents/export.ner.csv', data, function (__err) {
        if(__err) {
          console.log('err:', __err)
          return;
        }
        console.log('Smooth!')
      });
    }
  });
}
