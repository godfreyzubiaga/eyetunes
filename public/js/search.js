function search(keyword) {
  searchForPurchasedSongs();
  let resultTable = document.getElementById('table');
  resultTable.innerHTML = `
    <tr id="search-results" style="position: sticky">
      <th class="row">Song Title</th>
      <th class="row">Artist</th>
      <th class="row">Album</th>
      <th class="row">Year</th>
      <th class="row">Action</th>
    </tr>
  `;
  if (keyword === '') {
    keyword = ' ';
  }
  doAjax('GET', `/search/${encodeURIComponent(keyword)}`, null, xhr => {
    let songs = JSON.parse(xhr.responseText);
    songs.forEach(addSongToResult);

    function addSongToResult(row, index) {
      resultTable.innerHTML += `
        <tr>
          <td class="row">${row.title}</td>
          <td class="row">${row.artist}</td>
          <td class="row">${row.album}</td>
          <td class="row">${row.year}</td>
          <td class="row" id="${row.id}"><button class="btn" onclick="addSongToOwnSongList('${row.id}')">Add Song</button></td>
        </tr>
      `;

      if (index === songs.length - 1) {
        purchasedSongs.forEach(changeActionForPurchasedSong);
      }
    }

    function changeActionForPurchasedSong(id, index) {
      let actionRow = document.getElementById(`${id}`);
      if (actionRow) {
        actionRow.innerHTML = 'Owned';
      }
    }
  });
}
