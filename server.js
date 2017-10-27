const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 8084;
const dbUrl = 'mongodb://admin:eyetunesadmin@ds013495.mlab.com:13495/eyetunes';
const tokenSecret = 'eyetunessecretstuff';
let db;
let decodedId;

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
  let username = request.params.username.trim();
  let password = request.params.password.trim();
  let result;
  db.collection('users').findOne(
    {
      username: {
        $regex: `${username}`,
        $options: 'i'
      }
    },
    handleUserResult
  );

  function handleUserResult(error, dbResult) {
    if (dbResult !== null) {
      result = dbResult;
      bcrypt.compare(password, dbResult.password, handleSamePassword);
    } else {
      response.json({ userFound: false });
    }
  }

  function handleSamePassword(error, samePassword) {
    if (samePassword) {
      let id = result._id;
      jwt.sign({ id }, tokenSecret, (error, heresTheToken) => {
        result.token = heresTheToken;
        response.json(result);
      });
    } else {
      response.json({ passwordMatch: false });
    }
  }
});

app.post('/register/:name&:username&:password&:role', (request, response) => {
  let name = request.params.name.trim();
  let username = request.params.username.trim();
  let password = request.params.password.trim();
  let role = request.params.role.trim();
  let data = {
    name: '',
    username: '',
    role: '',
    password: ''
  };
  if (!name || !username || !password || !role || password.length < 6) {
    response.json({ registerSuccessful: false });
  } else {
    bcrypt.genSalt(12, (error, salt) => {
      bcrypt.hash(password, salt, handleEncryptedPassword);
    });
  }

  function handleEncryptedPassword(error, encryptedPassword) {
    db.collection('users').findOne({ username: username }, (error, result) => {
      if (result === null || !result.username) {
        data.name = name;
        data.username = username;
        data.role = role;
        data.password = encryptedPassword;
        if (role === 'user') {
          data.subscribed = false;
          dateSubscribed = 'none';
          subscriptionType = 'none';
          phoneNumber = 'none';
        }
        db.collection('users').insert(data, handleInsertResponse);
      } else {
        response.json({ registerSuccessful: false });
      }
    });
  }

  function handleInsertResponse(error) {
    if (!error) {
      response.json({ registerSuccessful: true });
    } else {
      response.json({ registerSuccessful: false });
    }
  }
});

app.get('/checkIfAvailable/:username', (request, response) => {
  let username = request.params.username.trim();
  if (username === 'admin') {
    response.json({ available: true });
  } else {
    db.collection('users').findOne({ username: username }, handleUserResult);
  }

  function handleUserResult(error, results) {
    if (results !== null) {
      results.username === username
        ? response.json({ available: false })
        : response.json({ available: true });
    } else {
      response.json({ available: true });
    }
  }
});

app.get('/get-user/:userId', (request, response) => {
  let id = request.params.userId;
  db.collection('users').findOne({ _id: ObjectId(id) }, handleUserResult);

  function handleUserResult(error, result) {
    if (!error) {
      response.json(result);
    }
  }
});

app.get('/get-songs/:userId', (request, response) => {
  let userId = request.params.userId.trim();
  let song;
  let songsLength;
  let songList = [];
  db.collection('users').findOne({ _id: ObjectId(userId) }, handleUserResult);

  function handleUserResult(error, user) {
    if (user.songList) {
      let songs = user.songList;
      songsLength = songs.length;
      songs.forEach(findSong);
    } else {
      response.json();
    }
  }

  function findSong(songId) {
    db.collection('songs').findOne({ _id: songId }, handleSongResult);
  }

  function handleSongResult(error, songResult) {
    db
      .collection('albums')
      .findOne(
        { songList:  ObjectId(songResult._id) },
        (error, album) => {
          db
            .collection('users')
            .find({ albums:  album._id } )
            .toArray((error, artistResult) => {
              song = {
                name: songResult.name,
                artist: artistResult,
                album: album.name,
                year: songResult.year,
                id: songResult._id
              };
              songList.push(song);
              if (songList.length === songsLength) {
                response.json({ list: songList });
              }
            });
        }
      );
  }
});

app.get('/get-album/:albumId', (request, response) => {
  let id = request.params.albumId;
  db.collection('albums').findOne({ _id: ObjectId(id) }, handleAlbumResult);

  function handleAlbumResult(error, result) {
    if (!error) {
      response.json(result);
    }
  }
});

app.get('/get-songs-from-album/:albumId', (request, response) => {
  let id = request.params.albumId;
  let albumSongsLength;
  let songs = [];
  db.collection('albums').findOne({ _id: ObjectId(id) }, handleAlbumResult);

  function handleAlbumResult(error, album) {
    let albumSongs = album.songList;
    if (albumSongs) {
      if (albumSongs.length < 1) {
        response.json({ result: 'none' });
      } else {
        albumSongsLength = albumSongs.length;
        if (albumSongsLength >= 1) {
          albumSongs.forEach(findSong);
        }
      }
    } else {
      response.json({ result: 'none' });
    }

    function findSong(songId) {
      db.collection('songs').findOne({ _id: songId }, handleSongResult);
    }
  }

  function handleSongResult(error, song) {
    songs.push(song);
    if (songs.length === albumSongsLength) {
      response.json(songs);
    }
  }
});

app.post('/create-album/:albumName&:userId', (request, response) => {
  let name = request.params.albumName.trim();
  let userId = request.params.userId.trim();
  if (validToken(localStorage.getItem('token'))) {
    if (name) {
      db.collection('albums').insertOne({ name: name }, handleAlbumResult);
    }
  
    function handleAlbumResult(error, document) {
      if (!error) {
        db.collection('users').update(
          { _id: ObjectId(`${userId}`) },
          {
            $addToSet: {
              albums: ObjectId(`${document.insertedId}`)
            }
          },
          handleInsertResponse
        );
      } else {
        response.json({ success: false });
      }
    }
  
    function handleInsertResponse(error, success) {
      if (error === null) {
        response.json({ success: true });
      } else {
        response.json({ success: false });
      }
    }
  }
});

app.post('/add-song-to-own-list/:songId&:userId', (request, response) => {
  let songId = request.params.songId.trim();
  let userId = request.params.userId.trim();
  db.collection('users').update(
    { _id: ObjectId(userId) },
    {
      $addToSet: {
        songList: ObjectId(`${songId}`)
      }
    },
    handleUpdateResponse
  );

  function handleUpdateResponse(error, updateResponse) {
    if (error === null) {
      response.json({ success: true });
    } else {
      response.json({ success: false });
    }
  }
});

app.post('/insert-song/:albumId&:songTitle&:yearReleased', (request, response) => {
    let albumId = request.params.albumId.trim();
    let songTitle = request.params.songTitle;
    let yearReleased = request.params.yearReleased;
    if (albumId && songTitle && yearReleased) {
      let song = { name: songTitle, year: yearReleased };
      db.collection('songs').insertOne(song, handleResponse);
    } else {
      response.json({ success: false });
    }

    function handleResponse(error, document) {
      db.collection('albums').update(
        { _id: ObjectId(`${albumId}`) },
        {
          $addToSet: {
            songList: ObjectId(`${document.insertedId}`)
          }
        },
        handleUpdateResponse
      );
    }

    function handleUpdateResponse(error, success) {
      if (!error) {
        response.json({ success: true });
      }
    }
  }
);

app.post('/remove-song/:id&:albumId', (request, response) => {
  let songId = request.params.id.trim();
  let albumId = request.params.albumId.trim();
  db
    .collection('albums')
    .update(
      { _id: ObjectId(albumId) },
      { $pull: { songList: ObjectId(songId) } },
      handleUpdateResponse
    );

  function handleUpdateResponse(error, result) {
    if (!error) {
      db
        .collection('songs')
        .deleteOne({ _id: ObjectId(songId) }, handleDeleteSong);
    } else {
      response.json({ success: false });
    }
  }

  function handleDeleteSong(error, result) {
    if (!error) {
      response.json({ success: true });
    } else {
      response.json({ success: false });
    }
  }
});

app.get('/search/:keyword', (request, response) => {
  let keyword = request.params.keyword.trim();
  let songLength;
  let searchResult = [];

  if (keyword === '') {
    keyword = '.';
  }

  db
    .collection('songs')
    .find({ name: { $regex: `${keyword}`, $options: 'i' } })
    .toArray(handleSongResult);

  function handleSongResult(error, songs) {
    if (songs.length >= 1) {
      songLength = songs.length;
      songs.forEach(findAlbum);
    }
  }

  function findAlbum(row) {
    db.collection('albums').findOne({
      songList: ObjectId(row._id)
    },
    (error, album) => {
      if (album !== null) {
        db.collection('users').findOne({
          albums: ObjectId(album._id)
        },
        (error, artist) => {
          if (artist !== null) {
            searchResult.push({
              title: row.name,
              artist: artist.name,
              album: album.name,
              year: row.year,
              id: row._id
            });
            if (searchResult.length === songLength) {
              response.json(searchResult);
            }
          }
        });
      }
    });
  }
});

app.post('/pay-subscription/:id&:subscriptionType&:phoneNumber', (request, response) => {
    let id = request.params.id.trim();
    let subscriptionType = request.params.subscriptionType.trim();
    let phoneNumber = request.params.phoneNumber.trim();
    let date = new Date();

    db.collection('users').update({ _id: ObjectId(id) },
    {
      $set: {
        subscribed: true,
        dateSubscribed: date,
        subscriptionType: subscriptionType,
        phoneNumber: phoneNumber
      }
    },
    (error, document) => {
      if (!error) {
        response.json({ success: true });
      } else {
        response.json({ success: false });
      }
    });
  }
);

app.get('/verify-and-get-userId/:token', (request, response) => {
  let token = request.params.token.trim();
  if (validToken(token) === true) {
    response.json({ verifiedUser: true, id: decodedId });    
  } else {
    response.json({ verifiedUser: false });
  }
});

function validToken(token) {
  let valid = false;
  jwt.verify(token, tokenSecret, (error, decoded) => {
    if (!error) {
      decodedId = decoded.id;
      valid = true;
    }
  });
  return valid;
}