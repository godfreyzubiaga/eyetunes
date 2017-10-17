function userHtml() {
  return `
  <p id="logout" class="links" onclick="logout()">Logout</p>
  <p id="profile" class="links" onclick="changeContent('profile')">Profile</p>
  <br>
  <br>
  <br>
  <div id="main-content">
    <div id="search-bar-container">
      <input type="text" id="search-bar" name="keyword" placeholder="Song, Artist or Album" />
    </div>
    <div id="search-btn-container">
      <button id="search" onclick="search(search-bar.value)">Search</button>
    </div>
    <div id="options">
      <input type="radio" name="option" id="song" checked value="song">
      <label for="song">Song</label>
      <input type="radio" name="option" id="album" value="album">
      <label for="album">Album</label>
      <input type="radio" name="option" id="artist" value="artist">
      <label for="artist">Artist</label>
    </div>
    <div id="result-container">
    </div>
  </div>
  `;
}
