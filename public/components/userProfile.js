function userProfile() {
  return `
    <div>
      <p id="logout" class="links" onclick="logout()">Logout</p>
      <p id="searchLink" class="links" onclick="changeContent('user')">Search Music</p>
    </div>
    <div id="main-content">
      <div id="sub-container">
        <div>
          <h1 id="name"></h1>        
        </div>
        <br><br><br>
        <div id="songList">
          <table id="table">
            <tr id="main-row">
              <th class="row">Song Title</th>
              <th class="row">Artist</th>
              <th class="row">Album</th>
              <th class="row">Year</th>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
}
