"use strict"

var sandcrawler = require('sandcrawler'),
    stringify   = require('csv-stringify'),
    fs          = require('fs'),
    path        = require('path'),
    db          = require('diskdb'),
    _           = require('lodash'),

    storage     = db.connect(__dirname + '/contents', ['records']),

    path        = require('path'),
    slug        = require('slug'),
    settings    = require('./settings') 

/*                                                                                                                                                     
╔═╗  ╦═╗┌─┐┌─┐┬ ┬┌┐ ┬  ┬┌─┐
╠═╣  ╠╦╝├┤ ├─┘│ │├┴┐│  ││  
╩ ╩  ╩╚═└─┘┴  └─┘└─┘┴─┘┴└─┘
┌─┐┌─┐                     
│ │├┤                      
└─┘└                       
╔═╗┌┬┐┌─┐┬  ┌─┐            
║╣ │││├─┤│  └─┐            
╚═╝┴ ┴┴ ┴┴─┘└─┘
*/

var scrapedIds  = _.map(db.records.find(), d => +d.url.replace(settings.baseUrl, '')),
    missingIds  = _.difference(_.range(1, settings.maxId), scrapedIds),

    // from numeric ids to urls
    jobs = _(missingIds)
                    .map(d => settings.baseUrl+d)
                    .take(settings.iterations)
                    .value();
// console.log(jobs)
// create spider
var spider = sandcrawler.spider()
    .url(jobs[0])
    .iterate(function(i, req, res) {
      if(!jobs[i])
        return false;
      return jobs[i]
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
      if(err){
        console.log(err);
        return;
      }

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





