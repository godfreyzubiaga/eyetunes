const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const app = express();
const port = process.env.port || 8084;
const dbUrl = 'mongodb://localhost:27017/eyetunes';
let db;

app.use(express.static(path.join(process.cwd(), 'public/')));

MongoClient.connect(dbUrl, (error, database) => {
  if (!error) {
    db = database;
    app.listen(port, () => {
      console.log(`App is live @ http://localhost:${port}!`);
    });
  }
});

app.get('/login/:username&:password', (request, response) => {
  let username = request.params.username;
  let password = request.params.password;
  db.collection('users').find({
    username: {
      $regex: `${username}`,
      $options: "i"
    },
    password: `${password}`
  }).toArray((error, results) => {
    if (!error) {
      response.json(results);
    }
  });
});

app.post('/register/:name&:username&:password&:role', (request, response) => {
  let name = request.params.name;
  let username = request.params.username;
  let password = request.params.password;
  let role = request.params.role;
  db.collection('users').insert({
    "name": name,
    "username": username,
    "password": password,
    "role": role
  }, () => {
    response.end();
  });
});

app.get('/get-users/', (request, response) => {
  db.collection('users').find().toArray((error, results) => {
    response.json(results);
  });
});