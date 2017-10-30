function editAlbum(id) {
  content.innerHTML = albumHtml();
  selectedAlbum = id;
  container = document.getElementById('main-content');
  let songListTable = document.getElementById('song-list');
  let box = document.getElementById('box');
  let albumName = document.getElementById('album-name');
  let removeBtn;

  songListTable.innerHTML = `
    <caption><h3 style="margin: 0">Song List</h3></caption>
    <tr style="position: sticky">
      <th class="row">Title</th>
      <th class="row">Year</th>
      <th class="row">Action</th>
    </tr>
  `;

  doAjax('GET', `/get-album/${id}`, null, xhr => {
    let response = JSON.parse(xhr.responseText);
    if (response.available !== false) {
      albumName.innerText = response.name;
    }
  });

  doAjax('GET', `/get-songs-from-album/${id}`, null, xhr => {
    let response = JSON.parse(xhr.responseText);
    if (response.success !== false && response.length > 0) {
      response.forEach(song => {
        songListTable.innerHTML += `
        <tr>
          <td>${song.name}</td>
          <td>${song.year}</td>
          <td><button class="btn" onclick="removeSong('${song._id}')">Remove</button></td>
        </tr>
      `;
      });
    }
    box.innerHTML += '<h4>------End------</h4>';
  });
  
}
