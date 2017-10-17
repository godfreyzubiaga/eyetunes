function userProfile() {
  return `
    <div>
      <p id="logout" class="links" onclick="logout()">Logout</p>
      <p id="searchLink" class="links" onclick="changeContent('user')">Search Music</p>
    </div>
    <br>
    <br>
    <br>
    <div id="main-content">
      <h1 id="name"></h1>
      <div id="songList">
        <table id="table">
          <tr id="main-row">
            <th id="songTitleRow">Song Title</th>
            <th id="artistRow">Artist</th>
            <th id="albumRow">Album</th>
            <th id="yearRow">Year</th>
          </tr>
        </table>
      </div>
    </div>
  `;
}
