var fs          = require('fs'),
    path        = require('path'),
    db          = require('diskdb'),
    _           = require('lodash'),
    async       = require('async'),
    mkdirp      = require('mkdirp'),
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
      var outdir = path.join(path.dirname(filepath), 'NER'),
          outpath = path.join(outdir, path.basename(filepath) + '.NER.json');
      
      console.log('-- storing stanfordNER responses in: ', outpath);
      
      mkdirp(outdir, function (err) {
        if (err)
          next(err);
        else
          fs.writeFile(outpath, JSON.stringify({
            annotated: response.raw,
            entities:response.entities
          }, null, 2), next);
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

q.push(_.map(db.records.find(), 'src'))
q.drain = function() {
  console.log('oh, yeh');
}