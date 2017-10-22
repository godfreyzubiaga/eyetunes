function addSongHtml() {
  return `
    <h2>Add song</h2>
    <div>
      <p>
        <label for="songTitle">Song Title</label>
      </p>
      <input type="text" class="fields" id="songTitle" placeholder="Song Title">
    </div>
    <div>
      <p>
        <label for="yearReleased">Year Released</label>
      </p>
      <input type="number" class="fields" id="yearReleased" placeholder="Year Released">
    </div>
    <div>
      <button class="btn" onclick="addSong(songTitle.value, yearReleased.value)">Add Song</button>
      <br>
      <button class="btn" onclick="editAlbum(selectedAlbum)">Cancel</button>
    </div>
  `;
}
