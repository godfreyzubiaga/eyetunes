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
      response.json(result);
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
        db.collection('users').insert(
          {
            name: name,
            username: username,
            role: role,
            password: encryptedPassword
          },
          handleInsertResponse
        );
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
  let username = (request.params.username).trim();
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
      songs.map(findSong);
    }
  }

  function findSong(row) {
    db.collection('songs').findOne({ _id: row.songId }, handleSongResult);
  }

  function handleSongResult(error, songResult) {
    db
      .collection('albums')
      .findOne(
        { songList: { $elemMatch: { songId: ObjectId(songResult._id) } } },
        (error, album) => {
          db
            .collection('users')
            .find({ albums: { $elemMatch: { albumId: album._id } } })
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
          albumSongs.map(findSong);
        }
      }
    } else {
      response.json({ result: 'none' });
    }

    function findSong(row) {
      db.collection('songs').findOne({ _id: row.songId }, handleSongResult);
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
  let name = request.params.albumName;
  let userId = request.params.userId;

  if (name) {
    db.collection('albums').insertOne({ name: name }, handleAlbumResult);
  }

  function handleAlbumResult(error, document) {
    if (!error) {
      db.collection('users').update(
        { _id: ObjectId(`${userId}`) },
        {
          $addToSet: {
            albums: { albumId: ObjectId(`${document.insertedId}`) }
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
});

app.post('/add-song-to-own-list/:songId&:userId', (request, response) => {
  let songId = request.params.songId.trim();
  let userId = request.params.userId.trim();
  db.collection('users').update(
    { _id: ObjectId(userId) },
    {
      $addToSet: {
        songList: { songId: ObjectId(`${songId}`) }
      }
    },
    {
      $upsert: true
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

app.post(
  '/insert-song/:albumId&:songTitle&:yearReleased',
  (request, response) => {
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
            songList: { songId: ObjectId(`${document.insertedId}`) }
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
      { $pull: { songList: { songId: ObjectId(songId) } } },
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

  db.collection('songs').find({ name: { $regex: `${keyword}`, $options: 'i' } }).toArray(handleSongResult);

  function handleSongResult(error, songs) {
    if (songs.length >= 1) {
      songLength = songs.length;
      songs.map(findAlbum);
    }
  }

  function findAlbum(row) {
    db.collection('albums').findOne({
      songList: {
        $elemMatch: {
          songId: ObjectId(row._id)
        }
      }
    }, (error, album) => {
      if (album !== null) {
        db.collection('users').findOne({
          albums: {
            $elemMatch: { albumId: ObjectId(album._id) }
          }
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
