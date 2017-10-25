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
        <input type="text" id="searchBar" name="keyword" placeholder="Song Title" />
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
