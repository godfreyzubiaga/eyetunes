const { validateToken } = require('./validateToken');

module.exports = {
  createAlbum: (response, db, data, ObjectId) => {
    let { albumName, userId } = data;

    if (albumName) {
      db.collection('albums').insertOne({ name: albumName }, handleAlbumResult);
    } else {
      response.status(400).json({ success: false });
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
        response.status(403).json({ success: false });
      }
    }

    function handleInsertResponse(error, success) {
      if (error === null) {
        response.status(200).json({ success: true });
      } else {
        response.status(403).json({ success: false });
      }
    }
  },

  getAlbum: (response, db, data, ObjectId) => {
    let albumId = data;
    db
      .collection('albums')
      .findOne({ _id: ObjectId(albumId) }, handleAlbumResult);

    function handleAlbumResult(error, result) {
      if (!error) {
        response.status(200).json(result);
      } else {
        response.status(404).json({ available: false });
      }
    }
  },

  getSongsFromAlbum: (response, db, data, ObjectId) => {
    let albumId = data;
    let albumSongsLength;
    let songs = [];
    db
      .collection('albums')
      .findOne({ _id: ObjectId(albumId) }, handleAlbumResult);

    function handleAlbumResult(error, album) {
      let albumSongs = album.songList;
      if (albumSongs) {
        if (albumSongs.length < 1) {
          response.json({ result: 'none' });
        } else {
          albumSongsLength = albumSongs.length;
          if (albumSongsLength >= 1) {
            albumSongs.forEach(findSong);
          } else {
            response.status(404).json({ available: false });
          }
        }
      } else {
        response.status(404).json({ available: false });
      }

      function findSong(songId) {
        db.collection('songs').findOne({ _id: songId }, handleSongResult);
      }
    }

    function handleSongResult(error, song) {
      songs.push(song);
      if (songs.length === albumSongsLength) {
        response.status(200).json(songs);
      }
    }
  },

  insertSong: (response, db, data, ObjectId) => {
    let { albumId, songTitle, yearReleased } = data;
    if (albumId && songTitle && yearReleased) {
      let song = { name: songTitle, year: yearReleased };
      db.collection('songs').insertOne(song, handleResponse);
    } else {
      response.status(400).json({ success: false });
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
        response.status(200).json({ success: true });
      } else {
        response.status(403).json({ success: false });
      }
    }
  },

  removeSong: (response, jwt, db, data, ObjectId) => {
    let { songId, albumId, userId, token } = data;
    if (validateToken(response, token, jwt)) {
      db
        .collection('albums')
        .update(
          { _id: ObjectId(albumId) },
          { $pull: { songList: ObjectId(songId) } },
          handleDeleteSong
        );

      function handleDeleteSong(error) {
        if (!error) {
          db
            .collection('users')
            .update(
              {},
              { $pull: { songList: ObjectId(songId) } }, 
              {multi: true},
              handleUpdateResponse
            );
        } else {
          response.status(403).json({ success: false });
        }
      }

      function handleUpdateResponse(error, result) {
        if (!error) {
          db
            .collection('songs')
            .deleteOne({ _id: ObjectId(songId) }, handleRemoveSongFromUsers);
        } else {
          response.status(403).json({ success: false });
        }
      }

      function handleRemoveSongFromUsers(error) {
        if (!error) {
          response.status(200).json({ success: true });
        } else {
          response.status(403).json({ success: false });
        }
      }
    } else {
      response.status(401).json({ success: false });
    }
  }
};
