function albumHtml() {
  return `
    <div>
      <p id="logout" class="links" onclick="logout()">Logout</p>
      <p id="profile" class="links" onclick="changeContent('artist')">Profile</p>
    </div>
    <div id="main-content">
      <h2 id="album-name">Album Name</h2>
      <div id="box">
        <table id="song-list">
          
        </table>
      </div>
      <div>
        <hr>
        <button class="btn" onclick="changeContent('addSong')">Add Song</button>
        <button class="btn">Delete Album</button>
      </div>
    </div>
  `;
}
