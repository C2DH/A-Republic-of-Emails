var sandcrawler = require('sandcrawler'),
    stringify   = require('csv-stringify'),
    fs          = require('fs'),
    db          = require('diskdb'),
    _           = require('lodash'),

    storage     = db.connect(__dirname + '/contents', ['records']),

    path        = require('path'),
    slug        = require('slug'),
    settings    = require('./settings') 

var c = db.records.count() + 1;
    starting = 'https://wikileaks.org/clinton-emails/emailid/' + c;

console.log('starting at', starting);


// create spider
var spider = sandcrawler.spider()
  .url(starting)
  .iterate(function(i, req, res) {
    var url = 'https://wikileaks.org/clinton-emails/emailid/' + ((c-1) + i + 1);
    if( i > settings.iterations)
      return false
    return url
  })
  .scraper(function($, done, params) {
    var heading = $('#header').scrape()[0],
        contents = $('#uniquer').scrape()[0];

    var couples = _(heading.split(/[\n\t]+/))
      .compact()
      .map(function(d) {
        return d.replace(/([a-zA-Z]):\s+/,'$1::::').split('::::')
      })
      .fromPairs()
      .value()
    
    var dirnum = Math.floor(params.req.url.match(/(\d+)$/)[0]/1000);
    // console.log(dirnum)
    var dir = path.join(settings.paths.dest, 'f-' + dirnum);
    var src = path.join(dir, slug(params.req.url) + '.txt');


    fs.mkdir(dir, function(err){
      // if(err)
      //   console.log(err);

      fs.writeFile(src, contents, function(err){
        if(err){
          console.log(err);
          throw 'stop'
        }
        couples.src = src;
        done(null, couples);
      });
    });
  })
  .result(function(err, req, res) {
    if(err)
      console.log(err);

    if(res && res.data)
      db.records.update({
        url: req.url 
      }, _.assign({}, res.data, {
        url: req.url,
      }), {
        upsert: true
      });
    console.log('Scraped:', req.url);
  })
  .run(function(err, remains) {
    console.log('And we are done!');
    var records = db.records.find();
    stringify(records, {
      delimiter: ';',
      quoted: true,
      header: true,
      columns: ['url', 'src', 'data', 'From', 'To', 'Subject', 'Date', 'contents']
    }, function(_err, data) {
      if(err){
        console.log('err', _err)
      } else {
        console.log('done!')
        fs.writeFile('./contents/export.csv', data, function (__err) {
          if(err) {
            console.log('err:', __err)
            return;
          }
          console.log('Smooth!')
        });
      }
    })
  });