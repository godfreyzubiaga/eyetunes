const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userHandler = require('./handlers/userHandler');
const serverHandler = require('./handlers/serverHandler');
const artistHandler = require('./handlers/artistHandler');
const bodyParser = require('body-parser');

const dbUrl = process.env.MLAB_URL || 'mongodb://localhost:27017/eyetunes';
const port = process.env.PORT || 8084;
const app = express();
let db;

app.use(express.static(path.join(process.cwd(), './public/')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect(dbUrl, (error, database) => {
  if (!error) {
    db = database;
    app.listen(port, () => {
      console.log(`App is live ${port}`);
    });
  }
});

app.get('/login/:username&:password', (request, response) => {
  const username = request.params.username;
  const password = request.params.password;
  const data = {
    username: username,
    password: password
  }
  serverHandler.login(response, data, db, jwt, bcrypt);
});

app.post('/register', (request, response) => {
  const data = request.body;
  serverHandler.register(response, data, db, bcrypt);
});

app.get('/check-username-availability/:username', (request, response) => {
  const username = request.params.username;
  serverHandler.usernameAvailability(response, username, db);
});

app.get('/get-user-via-token', (request, response) => {
  const data = request.header('Authorization');
  serverHandler.getUserIdViaToken(response, data, jwt);
});

app.get('/get-user/:id', (request, response) => {
  const userId = request.params.id;
  serverHandler.getUser(response, db, userId, ObjectId);
});

app.get('/get-songs/:userId', (request, response) => {
  const data = request.params.userId;
  userHandler.getSongs(response, db, data, ObjectId);
});

app.post('/add-song-to-own-list', (request, response) => {
  const data = request.body;
  userHandler.addSongToList(response, db, data, ObjectId);
});

app.get('/get-subscription/:token', (request, response) => {
  const data = request.params.token;
  userHandler.getSubscription(response, db, data, ObjectId);
});

app.get('/search/:keyword', (request, response) => {
  const data = request.params.keyword;
  userHandler.search(response, db, data, ObjectId);
});

app.post('/pay-subscription', (request, response) => {
  const data = request.body;
  userHandler.paySubscription(response, db, data, ObjectId);
});

app.post('/create-album', (request, response) => {
  const data = request.body;
  artistHandler.createAlbum(response, db, data, ObjectId);
});

app.get('/get-album/:albumId', (request, response) => {
  const data = request.params.albumId;
  artistHandler.getAlbum(response, db, data, ObjectId);
});

app.get('/get-songs-from-album/:albumId', (request, response) => {
  const data = request.params.albumId;
  artistHandler.getSongsFromAlbum(response, db, data, ObjectId);
});

app.post('/insert-song', (request, response) => {
  const data = request.body;
  artistHandler.insertSong(response, db, data, ObjectId);
});

app.post('/remove-song', (request, response) => {
  const data = request.body;
  data.token = request.header('Authorization');
  artistHandler.removeSong(response, jwt, db, data, ObjectId);
});