const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const app = express();
const port = process.env.port || 8084;
// const dbUrl = 'mongodb://eyetuneadmin413:eyetuneadmin413@ds013495.mlab.com:13495/eyetunes';
const dbUrl = 'mongodb://localhost:27017/eyetunes';
let db;
const htmlLink = `${process.cwd()}/public/html`;

app.use("/css", express.static(path.join(process.cwd(), '/public/css')));
// app.use("/resources", express.static(path.join(process.cwd(), '/public/resources')));
app.use(express.static(path.join(process.cwd(), 'public/html')));
MongoClient.connect(dbUrl, (error, database) => {
  if (!error) {
    db = database;    
    app.listen(port, () => {
      console.log(`App is live @ http://localhost:${port}!`);
    });
  }
});

app.get('/admin', (request, response) => {
  response.sendFile(`${htmlLink}/adminpage.html`);
});

app.get('/', (request, response) => {
  db.collection('songs').find().toArray((error, results) => {
    if (!error) {
      response.end(JSON.stringify(results));
    }
  });
  response.sendFile(`${htmlLink}/index.html`);
});