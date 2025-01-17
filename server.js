const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env')
});
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const bodyParser = require('body-parser');
const url = require('url');
const {Schema} = mongoose;

/* ********** Database configuration ********** */

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const urlSchema = new Schema({
  url: String,
  shortUrlNumber: Number
})
const Url = mongoose.model('Url', urlSchema);

function findUrl(urlHref, done){
  Url.find({url: urlHref}, function(err, data){
    if(err) return console.error(err);
    else done(null, data);
  });
}

function findUrlByNumber(urlNumber, done){
  Url.find({shortUrlNumber: urlNumber}, function(err, data){
    if(err) return console.error(err);
    else done(null, data);
  })
}

function findHighestNumber(done){
  Url.find({})
  .sort({shortUrlNumber: -1})
  .limit(1)
  .exec(function(err, shortUrlNumber){
    if(err) return console.error(err);
    else done(null, shortUrlNumber);
  });
}

function saveUrl(urlHref, num, done){
  const newUrl = new Url({
    url: urlHref,
    shortUrlNumber: num
  });
  newUrl.save(function(err, url){
    if(err) return console.error(err);
    else done(null, url);
  });
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function(req, res){
  try{
    const userUrl = new URL(req.body.url);

    if(userUrl.protocol != "https:" && userUrl.protocol != "http:"){
      res.json({"error": "invalid url"});
    }
    else {
      dns.lookup(userUrl.host, function(err, address){
        if(err) {
          res.json({"error": "Not a valid url"});
          return console.error(err);
        }
        else {
          findHighestNumber(function(err, urlHighest){
            if(err) return console.error(err);
            else {
              const userUrlNumber = urlHighest[0].shortUrlNumber + 1;
  
              saveUrl(userUrl.href, userUrlNumber, function(err, urlToSave){
                if(err) return console.error(err);
                else res.json({"original_url": urlToSave.url, "short_url": urlToSave.shortUrlNumber});
              })
            }
          })
        }
      });
    }
  } catch(e){
    res.json({"error": "invalid url"});
    console.log(e);
  }
});

app.get('/api/shorturl/:number', function(req, res){
    findUrlByNumber(req.params.number, function(err, url){
      if(err) return console.error(err);
      else {
        try{
          res.redirect(url[0].url);
        } catch(e){
          res.json({"error": "Can't find the url"});
          console.error(e);
        }
      }
    })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
