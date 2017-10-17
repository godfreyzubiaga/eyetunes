function addAlbumHtml() {
  return `
    <div>
      <p id="logout" class="links" onclick="logout()">Logout</p>
      <p id="profile" class="links" onclick="changeContent('artist')">Profile</p>
    </div>
    <div id="content-container">
      <label for="albumNameField" id="labelForAlbumName"><h2>Album Name</h2></label>
      <input type="text" class="fields" id="albumNameField" placeholder="Album Name">
      <div>
        <button class="btn" onclick="createAlbum(albumNameField.value)">Create Album</button>
        <br>
        <button class="btn" onclick="changeContent('artist')">Cancel</button>
      </div>
    </div>
  `;
}
