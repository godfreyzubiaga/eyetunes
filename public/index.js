let content;
let activeUser;
let regUsernameField;
let regPasswordField;
let mainRow;
window.onload = () => {
  content = document.getElementById('content');
  content.innerHTML = loginHtml();
};

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
  <p id="profile" onclick="changeContent('profile')">Profile</p>
  <br>
  <br>
  <br>
  <div id="main-content">
    <div id="search-bar-container">
      <input type="text" id="search-bar" name="keyword" placeholder="Song, Artist or Album" />
    </div>
    <div id="search-btn-container">
      <button id="search" onclick="search(search-bar.value)">Search</button>
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

function adminHtml() {
  return `
    <p id="logout" onclick="logout()">Logout</p>
    <br>
    <br>
    <div id="main-content">
      <h1>Admin Page</h1>
    </div>
  `;
}

function artistHtml() {
  return `
    <div>
      <p id="logout" onclick="logout()">Logout</p>
    </div>
    <br>
    <br>
    <div id="main-content">
      <h1 id="headerText">Artist's Page</h1>
    </div>
  `;
}

function profileHtml() {
  return `
    <div>
      <p id="logout" onclick="logout()">Logout</p>
      <p id="searchLink" onclick="changeContent('user')">Search Music</p>
    </div>
    <br>
    <br>
    <br>
    <div id="main-content">
      <h1 id="name">Name Here</h1>
      <div id="songList">
        <table>
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

function logout() {
  activeUser = '';
  changeContent('login');
}

function changeContent(page) {
  if (page === 'login') {
    content.innerHTML = loginHtml();
  } else if (page === 'register') {
    content.innerHTML = registerHtml();
    loginLink.onclick = () => {
      content.innerHTML = loginHtml();
    };
    regUsernameField = document.getElementById('username');
    regPasswordField = document.getElementById('password');
  } else if (page === 'user' && activeUser) {
    content.innerHTML = userHtml();
  } else if (page === 'artist') {
    content.innerHTML = artistHtml();
  } else if (page === 'admin') {
    content.innerHTML = adminHtml();
  } else if (page === 'profile') {
    content.innerHTML = profileHtml();
    mainRow = document.getElementById('main-row');
    let name = document.getElementById('name');
    doAjax('GET', `/get-user/${encodeURIComponent(activeUser)}`, (xhr) => {
      let user = JSON.parse(xhr.responseText);
      name.innerText = user.name;
    });

    doAjax('GET', `/get-songs/${encodeURIComponent(activeUser)}`, xhr => {
      let songs = JSON.parse(xhr.responseText);
      songs.map(row => {
        mainRow.innerHTML += `
        <tr class="songColumn">
          <td>${row.title}</td>
          <td id="artistRow">${row.artist}</td>
          <td id="albumRow">${row.album}</td>
          <td id="yearRow">${row.year}</td>
        </tr>`;
      });
    });
  }
}

function login(username, password) {
  if (!username || !password) {
    alert('Please fill up the form completely');
  } else {
    doAjax(
      'GET',
      `/login/${encodeURIComponent(username)}&${encodeURIComponent(password)}`,
      xhr => {
        const data = JSON.parse(xhr.responseText);
        if (data._id) {
          activeUser = data._id;
          changeContent(data.role);
        } else {
          alert('User not found');
        }
      }
    );
  }
}

function register(name, username, password) {
  let roleOptions = document.getElementsByName('role');
  let role;
  roleOptions.forEach(row => {
    if (row.checked) {
      role = row.value;
    }
  });
  if (password.length <= 6 || !name || !username || !password || !role) {
    alert('Please fill up all forms completely');
  } else {
    doAjax(
      'POST',
      `/register/${encodeURIComponent(name)}&${encodeURIComponent(
        username
      )}&${encodeURIComponent(password)}&${encodeURIComponent(role)}`,
      showSuccess
    );
  }
}

function checkIfAvailable(username) {
  if (username === '') {
    regUsernameField.style.borderColor = 'black';
  } else {
    doAjax('GET', `/checkIfAvailable/${encodeURIComponent(username)}`, xhr => {
      let response = JSON.parse(xhr.responseText);
      response.available
        ? (regUsernameField.style.borderColor = 'lightgreen')
        : (regUsernameField.style.borderColor = 'red');
    });
  }
}

function passwordCheck(password) {
  if (password === '') {
    regPasswordField.style.borderColor = 'black';
  } else {
    password.length >= 6
      ? (regPasswordField.style.borderColor = 'lightgreen')
      : (regPasswordField.style.borderColor = 'red');
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
  };
  xhr.open(method, url, true);
  xhr.send();
}
