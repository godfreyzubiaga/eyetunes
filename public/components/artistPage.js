function artistHtml() {
  return `
    <div>
      <p id="logout" class="links" onclick="logout()">Logout</p>
    </div>
    <br>
    <br>
    <div id="main-content">
      <h1 id="headerText"></h1>
      <h2>My albums</h2>
      <div id="box">
      </div>
      <div>
        <button id="submitBtn" onclick="changeContent('addAlbum')">Add Album</button>
      </div>
    </div>
  `;
}
