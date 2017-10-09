<<<<<<< HEAD
if ()
=======
let content;
window.onload = () => {
  content = document.getElementById('content');
  content.innerHTML = loginHtml();
}

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
      <button type="submit" id="submitBtn">Submit</button>
      <br>
      <span id="registerLink" onclick="changeContent('register')">Register here</span>
    </div>
  </div>`;
}

function registerHtml() {
  return `
    <div id="content-container">
      <h1>Register</h1>
      <div id="field-container">
        <label class="labels" for="fullname">Full Name / Band Name</label>
        <br>
        <input type="text" name="name" id="fullname" class="fields"/>
        <br>
        <label class="labels" for="username">Username</label>
        <br>
        <input type="text" name="username" id="username" class="fields"/>
        <br>
        <label class="labels" for="password">Passsword</label>
        <br>
        <input type="password" name="password" id="password" class="fields"/>
        <br>
        <div id="options">
          <input type="radio" name="option" id="artist" value="artist">
          <label for="artist">Artist</label>
          <input type="radio" name="option" id="user" checked value="artist">
          <label for="user">User</label>
        </div>
        <button type="submit" id="submitBtn">Submit</button>
        <br>
        <span id="loginLink" onclick="changeContent('login')">Login here</span>
      </div>
    </div>
  `;

  loginLink.onclick = () => {
    content.innerHTML = loginHtml();
  }
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

function changeContent(page) {
  if (page === 'login') {
    content.innerHTML = loginHtml();
  } else if (page === 'register') {
    content.innerHTML = registerHtml();
  }
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
>>>>>>> f8a481410a9cd47f346582292609414feed91fd2
