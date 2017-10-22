let content;
let activeUser;
let regUsernameField;
let regPasswordField;
let mainRow;
let container;
let selectedAlbum;
window.onload = () => {
  content = document.getElementById('content');
  content.innerHTML = loginHtml();
};

function logout() {
  activeUser = '';
  changeContent('login');
}

function changeContent(page, albumId) {
  if (page === 'login') {
    content.innerHTML = loginHtml();
  } else if (page === 'register') {
    content.innerHTML = registerHtml();
    loginLink.onclick = () => {
      content.innerHTML = loginHtml();
    };
    regUsernameField = document.getElementById('username');
    regPasswordField = document.getElementById('password');
  } else if (page === 'user') {
    content.innerHTML = userHtml();
  } else if (page === 'artist') {
    content.innerHTML = artistHtml();
    let headerText = document.getElementById('headerText');
    let box = document.getElementById('box');
    doAjax('GET', `/get-user/${encodeURIComponent(activeUser)}`, xhr => {
      let user = JSON.parse(xhr.responseText);
      headerText.innerText = `Welcome, ${user.name}`;
      box.innerHTML = '';
      user.albums.map(row => {
        doAjax('GET', `/get-album/${row.albumId}`, xhr => {
          let album = JSON.parse(xhr.responseText);
          box.innerHTML += `
            <div onclick="editAlbum('${album._id}')" class="albumContainer">
              <div class="album">${album.name}</div>
            </div>
            `;
        });
      });
    });
  } else if (page === 'admin') {
    content.innerHTML = adminHtml();
  } else if (page === 'profile') {
    content.innerHTML = userProfile();
    table = document.getElementById('table');
    let name = document.getElementById('name');
    doAjax('GET', `/get-user/${encodeURIComponent(activeUser)}`, xhr => {
      let user = JSON.parse(xhr.responseText);
      name.innerText = user.name;
    });

    doAjax('GET', `/get-songs/${encodeURIComponent(activeUser)}`, xhr => {
      let songs = JSON.parse(xhr.responseText).list;
      let artists = '';
      songs.map(row => {
        row.artist.map((artist, index) => {
          if (index === row.artist.length - 1) {
            artists += artist.name + ' ';
          } else {
            artists += artist.name + ', ';
          }
        });
        table.innerHTML += `
        <tr class="songColumn">
          <td>${row.name}</td>
          <td id="artistRow">${artists}</td>
          <td id="albumRow">${row.album}</td>
          <td id="yearRow">${row.year}</td>
        </tr>`;
      });
    });
  } else if (page === 'addAlbum') {
    content.innerHTML = addAlbumHtml();
  } else if (page === 'addSong') {
    container.innerHTML = addSongHtml();
  }
}

function editAlbum(id) {
  content.innerHTML = albumHtml();
  selectedAlbum = id;
  container = document.getElementById('main-content');
  let songListTable = document.getElementById('song-list');
  let albumName = document.getElementById('album-name');
  let removeBtn = `<button class="btn" onclick="confirm('are you sure?')">Remove</button>`;

  songListTable.innerHTML = `
    <caption><h3 style="margin: 0">Song List</h3></caption>
    <tr style="position: sticky">
      <th class="songRow">Title</th>
      <th class="songRow">Year</th>
      <th class="songRow">Action</th>
    </tr>
  `;

  doAjax('GET', `/get-album/${id}`, xhr => {
    let album = JSON.parse(xhr.responseText);
    albumName.innerText = album.name;
  });

  doAjax('GET', `/get-songs-from-album/${encodeURIComponent(id)}`, xhr => {
    let response = JSON.parse(xhr.responseText);
    if (response.result !== 'none') {
      response.map(song => {
        songListTable.innerHTML += `
        <tr>
          <td>${song.name}</td>
          <td>${song.year}</td>
          <td>${removeBtn}</td>
        </tr>
      `;
      });
    }
  });
}

function addSong(title, year) {
  if (title === '' || year === '') {
    alert('Please fill up the form completely');
  } else {
    console.log(title, year);
  }
}

function createAlbum(albumName) {
  if (albumName) {
    doAjax(
      'POST',
      `/create-album/${encodeURIComponent(albumName)}&${encodeURIComponent(
        activeUser
      )}`,
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          alert('Success');
          changeContent('artist');
        } else {
          alert('Failed');
        }
      }
    );
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
      `/register/${encodeURIComponent(name)}
      &${encodeURIComponent(username)}
      &${encodeURIComponent(password)}
      &${encodeURIComponent(role)}`,
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
