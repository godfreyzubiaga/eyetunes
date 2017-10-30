module.exports = {
  getSongs: (response, db, data, ObjectId) => {
    let userId = data;
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
        response.status(404).json({ available: false });
      }
    }

    function findSong(songId) {
      db.collection('songs').findOne({ _id: songId }, handleSongResult);
    }
    
    function handleSongResult(error, songResult) {
      db
        .collection('albums')
        .findOne({ songList: ObjectId(songResult._id) }, (error, album) => {
          db
            .collection('users')
            .find({ albums: album._id })
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
        });
    }
  },

  addSongToList: (response, db, data, ObjectId) => {
    let songId = data.songId;
    let userId = data.userId;
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
      if (!error) {
        response.status(200).json({ success: true });
      } else {
        response.status(403).json({ success: false });
      }
    }
  },

  getSubscription: (response, db, data, ObjectId) => {
    let userId = data;
    db.collection('users').findOne({ _id: ObjectId(userId) }, handleUserResult);

    function handleUserResult(error, user) {
      if (!error) {
        if (user.subscribed) {
          response.status(200).json({
            type: user.subscriptionType,
            date: user.dateSubscribed,
            subscribed: user.subscribed
          });
        } else {
          response.status(200).json({subscribed: false});
        }
      } else {
        response.status(403).json({ available: false });
      }
    }
  },

  search: (response, db, data, ObjectId) => {
    let keyword = data;
    let songLength;
    let searchResult = [];
    if (keyword === ' ') {
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
      } else {
        response.status(400).json({ success: false });
      }
    }

    function findAlbum(song) {
      db.collection('albums').findOne({
        songList: ObjectId(song._id)
      },
      (error, album) => {
        if (album !== null) {
          db.collection('users').findOne({
            albums: ObjectId(album._id)
          },
          (error, artist) => {
            if (artist !== null) {
              searchResult.push({
                title: song.name,
                artist: artist.name,
                album: album.name,
                year: song.year,
                id: song._id
              });
              if (searchResult.length === songLength) {
                response.status(200).json(searchResult);
              }
            } else {
              response.status(403).json({ success: false });
            }
          });
        }
      });
    }
  },

  paySubscription: (response, db, data, ObjectId) => {
    let id = data.userId;
    let subscriptionType = data.subscriptionType;
    let phoneNumber = data.phoneNumber;
    let date = new Date().toISOString;

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
        response.status(200).json({ success: true });
      } else {
        response.status(403).json({ success: false });
      }
    });
  }
};
