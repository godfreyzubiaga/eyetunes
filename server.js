const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 8084;
const dbUrl = 'mongodb://admin:eyetunesadmin@ds013495.mlab.com:13495/eyetunes';
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

  db.collection('users').findOne({
    username: {
      $regex: `${username}`,
      $options: 'i'
    }
  },
  (error, result) => {
    if (!error) {
      bcrypt.compare(password, result.password, (error, samePassword) => {
        if (samePassword) {
          response.json(result);
        } else {
          response.json({ passwordMatch: false });
        }
      });
    } else {
      response.json({ userFound: false });
    }
  });
});

app.post('/register/:name&:username&:password&:role', (request, response) => {
  let name = request.params.name;
  let username = request.params.username;
  let password = request.params.password;
  let role = 'admin';
  if (!name || !username || !password || !role || password.length <= 6) {
    response.json({ registerSuccessful: false });
  } else {
    bcrypt.genSalt(12, (error, salt) => {
      bcrypt.hash(password, salt, (error, encryptedPassword) => {
        db.collection('users').findOne({ username: username }, (error, result) => {
            if (!result.username) {
              db.collection('users').insert({
                name: name,
                username: username,
                role: role,
                password: encryptedPassword
              }, () => {
                response.json({ registerSuccessful: true });
              });
            } else {
              response.json({ registerSuccessful: false });
            }
          });
      });
    });
  }
});

app.get('/checkIfAvailable/:username', (request, response) => {
  let username = request.params.username;
  if (username === 'admin') {
    response.json({ available: true });
  } else {
    db.collection('users').findOne({ username: username }, (error, results) => {
      results.length >= 1? response.json({ available: false }) : response.json({ available: true });
    });
  }
});

app.get('/get-user/:userId', (request, response) => {
  let id = request.params.userId;
  db.collection('users').findOne({ _id: ObjectId(id) }, (error, result) => {
    if (!error) {
      response.json(result);
    }
  });
});

app.get('/get-songs/:userId', (request, response) => {
  let userId = request.params.userId;
  let song;
  let songList = [];
  db.collection('users').findOne({ _id: ObjectId(userId) }, (error, user) => {
    let songIds = user.songList;
    songIds.map((row, index) => {
      db.collection('songs').findOne({ _id: row.songId }, (error, songResult) => {
          db.collection('albums').findOne({songList: { $elemMatch: { songId: ObjectId(songResult._id) } }},
          (error, album) => {
            db.collection('users').find({ albums: { $elemMatch: { albumId: album._id } } }).toArray(
              (error, artistResult) => {
                song = {
                  name: songResult.name,
                  artist: artistResult,
                  album: album.name,
                  year: songResult.year
                };
                songList.push(song);
                if (index === songIds.length - 1) {
                  response.json({ list: songList });
                }
              });
          });
        });
    });
  });
});

app.get('/get-album/:albumId', (request, response) => {
  let id = request.params.albumId;
  db.collection('albums').findOne({ _id: ObjectId(id) }, (error, result) => {
    if (!error) {
      response.json(result);
    }
  });
});

app.get('/get-songs-from-album/:albumId', (request, response) => {
  let id = request.params.albumId;
  let songs = [];
  db.collection('albums').findOne({ _id: ObjectId(id) }, (error, album) => {
    if(album.songList) {
      album.songList.map((row, index) => {
        db.collection('songs').findOne({_id: row.songId}, (error, song) => {
          songs.push(song);
          if(index === album.songList.length - 1) {
            response.json(songs);
          }
        });
      });
    } else {
      response.json({'result' : 'none'})
    }
  });
});

app.post('/create-album/:albumName&:userId', (request, response) => {
  let name = request.params.albumName;
  let userId = request.params.userId;
  if(name) {
    db.collection('albums').insertOne({'name': name}, (error, document) => {
      if (!error) {
        db.collection('users').update({_id: ObjectId(`${userId}`)}, 
          {$addToSet: {albums: {albumId:  ObjectId(`${document.insertedId}`)}}},
          (error, success) => {
            if (!error) {
              response.json({success: true});
            } else {
              response.json({success: false});
            }
        });
      } else {
        response.json({success: false});
      }
    })
  }
});

app.post('/insert-song/:albumId&:songTitle&:yearReleased', (request, response) => {
  let albumId = (request.params.albumId).trim();
  let songTitle = request.params.songTitle;
  let yearReleased = request.params.yearReleased;
  if (albumId && songTitle && yearReleased) {
    let song = {'name': songTitle, 'year': yearReleased};
    db.collection('songs').insertOne(song, (error, document) => {
      db.collection('albums').update({_id: ObjectId(`${albumId}`)},
        {$addToSet: {songList: {songId:  ObjectId(`${document.insertedId}`)}}},
        (error, success) => {
          if (!error) {
            response.json({success: true});
          }
      });
    });
  } else {
    response.json({success: false});  
  }
});