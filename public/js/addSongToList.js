function addSongToOwnSongList(songId) {
  doAjax(
    'POST',
    `/add-song-to-own-list`,
    {
      songId: songId,
      userId: activeUser
    },
    handleResponse
  );

  function handleResponse(xhr) {
    let response = JSON.parse(xhr.responseText);
    if (response.success) {
      alertify.success('Song successfully added to your personal list');
      changeContent('profile');
    } else {
      alertify.error('Something went wrong');
    }
  }
}
