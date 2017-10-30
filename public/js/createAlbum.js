function createAlbum(albumName) {
  if (albumName) {
    doAjax(
      'POST',
      `/create-album`,
      {
        albumName: albumName,
        userId: activeUser
      },
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          alertify.success('Album created!');
          changeContent('artist');
        } else {
          alertify.error('Failed to create an Album');
        }
      }
    );
  }
}
