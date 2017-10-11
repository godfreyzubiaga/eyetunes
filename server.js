const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const bcrypt = require('bcrypt');

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
    }
  }).toArray((error, results) => {
    if (!error) {
      results.map(row => {
        bcrypt.compare(password, row.password, (error, samePassword) => {
          if (samePassword) {
            response.json(row);
          }
        });
      });
    }
  });
});

app.post('/register/:name&:username&:password&:role', (request, response) => {
  let name = request.params.name;
  let username = request.params.username;
  let password = request.params.password;
  let role = request.params.role;
  bcrypt.genSalt(12, (error, salt) => {
    bcrypt.hash(password, salt, (error, encryptedPassword) => {
      db.collection('users').find({'username': username}, (error, result) => { 
        if (result.username !== username) {
          db.collection('users').insert({
            "name": name,
            "username": username,
            "role": role,
            "password": encryptedPassword
          }, () => {
            response.json({'registerSuccessful': true});
          });
        } else {
          response.json({'registerSuccessful': false});
        }
      });
    })
  });
});

app.get('/checkIfAvailable/:username', (request, response) => {
  let username = request.params.username;
  if (username === 'admin') {
    response.json({"available": true});
  } else {
    db.collection('users').find({
      'username': username
    }).toArray((error, results) => {
      results.length >= 1 ? response.json({"available": false}) : response.json({"available": true});
    });
  }
  
});