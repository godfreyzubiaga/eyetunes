function userHtml() {
  return `
  <p id="logout" class="links" onclick="logout()">Logout</p>
  <p id="profile" class="links" onclick="changeContent('profile')">Profile</p>
  <br>
  <br>
  <br>
  <div id="main-content">
    <div id="sub-container"> 
      <div id="search-bar-container">
        <input type="text" id="searchBar" name="keyword" placeholder="Song, Artist or Album" />
      </div>
      <div id="options">
        <input type="radio" name="category" id="song" checked value="song">
        <label for="song">Song</label>
        <input type="radio" name="category" id="album" value="album">
        <label for="album">Album</label>
        <input type="radio" name="category" id="artist" value="artist">
        <label for="artist">Artist</label>
      </div>
      <div id="search-btn-container">
        <button id="search" onclick="search(searchBar.value)">Search</button>
      </div>
      <div id="result-container">
        <table id="table">
         
        </table>
      </div>
    </div>
  </div>
  `;
}
