const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env')
});
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function(req, res){
  res.json({"original_url": "www.example.com", "short_url": "examp.le"});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
