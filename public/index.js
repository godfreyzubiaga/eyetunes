function loginHtml() {
  return `
  <div id="content-container">
    <h1>Login</h1>
    <div id="field-container">
      <label class="labels" for="username">Username</label>
      <br>
      <input type="text" name="username" id="username" class="fields" required/>
      <br>
      <label class="labels" for="password">Passsword</label>
      <br>
      <input type="password" name="password" id="password" class="fields" required/>
      <br>
      <button type="submit" id="loginBtn">Submit</button>
      <br>
      <span id="register">Register here</span>
    </div>
  </div>`;
}

function userHtml() {
  return `
  <div id="main-content">
    <div id="search-bar-container">
      <input type="text" id="search-bar" name="keyword" placeholder="Song, Artist or Album" />
    </div>
    <div id="search-btn-container">
      <button id="search" onclick="changeContent()">Search</button>
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

window.onload = () => {
  document.getElementById('content').innerHTML = loginHtml();  
}

function doAjax(method, url, customFunction) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      customFunction(xhr);
    }
  }
  xhr.open(method, url, true);
  xhr.send();
}