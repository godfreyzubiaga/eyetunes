function addSong(title, year) {
  if (
    title === '' ||
    year === '' ||
    year <= 1800 ||
    year > new Date().getFullYear()
  ) {
    alertify.alert('Please fill up the form completely/correctly');
  } else {
    doAjax(
      'POST',
      '/insert-song/',
      {
        albumId: selectedAlbum,
        songTitle: title,
        yearReleased: year
      },
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          alertify.success('Song was successfully added.');
          editAlbum(selectedAlbum);
        } else {
          alertify.error('Something is wrong');
        }
      }
    );
  }
}
