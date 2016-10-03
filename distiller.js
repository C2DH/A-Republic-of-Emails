var fs          = require('fs'),
    db          = require('diskdb'),
    _           = require('lodash'),
    async       = require('async'),
    publicEye   = require('public-eye')(),
    storage     = db.connect(__dirname + '/contents', ['records']);


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
      console.log('-- parsing with stanfordNER file: ', filepath);
      publicEye.stanfordNER({
        text: contents
      }, next);
    },

    function(response, next) {
      console.log('-- storing stanfordNER responses in: ', filepath + '.NER.json');
      fs.writeFile(filepath + '.NER.json', JSON.stringify({
        annotated: response.raw,
        entities:response.entities
      }, null, 2), next);
    }
  ], function(err) {
    if(err) {
      q.kill();
      console.error(err)
    }
    nextFile();
  });

  
}, 3);

q.push(_.map(db.records.find(), 'src'))
q.drain = function() {
  console.log('oh, yeh');
}