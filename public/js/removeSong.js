function removeSong(id) {
  let confirmed = alertify.confirm('Are you sure?', () => {
    if (confirmed) {
      doAjax(
        'POST',
        `/remove-song`,
        {
          songId: id,
          albumId: selectedAlbum,
          userId: activeUser
        },
        xhr => {
          let response = JSON.parse(xhr.responseText);
          if (response.success) {
            alertify.success('Song was successfully removed');
            editAlbum(selectedAlbum);
          }
        }
      );
    }
  });
}
