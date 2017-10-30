function searchForPurchasedSongs() {
  doAjax('GET', `/get-songs/${activeUser}`, null, xhr => {
    if (xhr.responseText) {
      let songs = JSON.parse(xhr.responseText).list;
      if (songs.length >= 1) {
        songs.forEach(addSongToPurchasedSong);
      }
    }
  });

  function addSongToPurchasedSong(row) {
    purchasedSongs.push(row.id);
  }
}