const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const app = express();
const port = process.env.port || 8084;
const dbUrl = 'mongodb://localhost:27017/eyetunes';
let db;

app.use(express.static(path.join(process.cwd(), 'public')));

MongoClient.connect(dbUrl, (error, database) => {
  if (!error) {
    db = database;
    app.listen(port, () => {
      console.log(`App is live @ http://localhost:${port}!`);
    });
  }
});

