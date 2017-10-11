let content;
let activeUser;
let regUsernameField;
let regPasswordField;
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
      <button type="submit" onclick="login(username.value, password.value)" id="submitBtn">Submit</button>
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
        <input type="text" name="username" id="username" class="fields" onkeyup="checkIfAvailable(username.value)"/>
        <br>
        <label class="labels" for="password" >Passsword</label>
        <p id="subLabel">(6 or more characters)</p>
        <br>
        <input type="password" name="password" id="password" class="fields" onkeyup="passwordCheck(password.value)">
        <div id="options">
          <input type="radio" name="role" id="artist" value="artist">
          <label for="artist">Artist</label>
          <input type="radio" name="role" id="user" checked value="user">
          <label for="user">User</label>
        </div>
        <button type="submit" id="submitBtn" onclick="register(fullname.value, username.value, password.value)">Submit</button>
        <br>
        <span id="loginLink" onclick="changeContent('login')">Login here</span>
      </div>
    </div>
  `;
}

function userHtml() {
  return `
  <p id="logout" onclick="logout()">Logout</p>  
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

function logout() {
  activeUser = "";
  changeContent('login');
}

function changeContent(page) {
  if (page === 'login') {
    content.innerHTML = loginHtml();
  } else if (page === 'register') {
    content.innerHTML = registerHtml();
    loginLink.onclick = () => {
      content.innerHTML = loginHtml();
    }
    regUsernameField = document.getElementById('username');
    regPasswordField = document.getElementById('password');
  } else if (page === 'user' && activeUser) {
    content.innerHTML = userHtml();
  } else if (page === 'artist') {

  } else if (page === 'admin') {

  }
}

function login(username, password) {
  if (!username || !password) {
    alert('Please fill up the form completely')
  } else {
    doAjax('GET', `/login/${encodeURIComponent(username)}&${encodeURIComponent(password)}`, (xhr) => {
      const data = JSON.parse(xhr.responseText);
      if (data.length != 0) {
        alert('Login Succesful');
        changeContent(data.role);
        activeUser = data._id;
      } else {
        alert('User not found');
      }
    });
  }
}

function register(name, username, password) {
  let roleOptions = document.getElementsByName('role');
  let role;
  roleOptions.forEach((row) => {
    if (row.checked) {
      role = row.value;
    }
  });
  if (password.length <= 6 || !name || !username || !password || !role) {
    alert('Please fill up all forms completely');
  } else {
    doAjax('POST',
      `/register/${encodeURIComponent(name)}&${encodeURIComponent(username)}&${encodeURIComponent(password)}&${encodeURIComponent(role)}`,
      showSuccess);
  }
}

function checkIfAvailable(username) {
  if (username === '') {
    regUsernameField.style.borderColor = 'black';
  } else {
    doAjax('GET', `/checkIfAvailable/${encodeURIComponent(username)}`, (xhr) => {
      let response = JSON.parse(xhr.responseText);
      response.available ? regUsernameField.style.borderColor = 'green' : regUsernameField.style.borderColor = 'red';
    });
  }
}

function passwordCheck(password) {
  if (password === '') {
    regPasswordField.style.borderColor = 'black';
  } else {
    password.length >= 6 ? regPasswordField.style.borderColor = 'green' : regPasswordField.style.borderColor = 'black';
  }
}

function showSuccess(xhr) {
  let response = JSON.parse(xhr.responseText);
  if (response.registerSuccessful) {
    alert('Signup success');
    changeContent('login');
  } else {
    alert('something is wrong with your inputs');
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