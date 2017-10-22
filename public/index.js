let content;
let activeUser;
let regUsernameField;
let regPasswordField;
let mainRow;
let container;
let selectedAlbum = '';
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
        <tr class="song-column">
          <td>${row.name}</td>
          <td id="artistRow">${artists}</td>
          <td id="albumRow">${row.album}</td>
          <td id="yearRow">${row.year}</td>
        </tr>`;
        artists = '';
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
  let box = document.getElementById('box');
  let albumName = document.getElementById('album-name');
  let removeBtn

  songListTable.innerHTML = `
    <caption><h3 style="margin: 0">Song List</h3></caption>
    <tr style="position: sticky">
      <th class="row">Title</th>
      <th class="row">Year</th>
      <th class="row">Action</th>
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
          <td><button class="btn" onclick="removeSong('${song._id}')">Remove</button></td>
        </tr>
      `;
      });
    }
    box.innerHTML += '<h4>------End------</h4>';
  });
}

function addSong(title, year) {
  if (title === '' || year === '' ||year <= 1800 ||year > new Date().getFullYear() ) {
    alert('Please fill up the form completely/correctly');
  } else {
    doAjax('POST', `/insert-song/
    ${encodeURIComponent(selectedAlbum)}
    &${encodeURIComponent(title)}
    &${encodeURIComponent(year)}`,
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          alert('Song was successfully added.');
          editAlbum(selectedAlbum);
        } else {
          alert('something is wrong');
        }
      }
    );
  }
}

function removeSong(id) {
  let confirmed = confirm('are you sure?');
  if (confirmed) {
    doAjax('POST', 
      `/remove-song/${encodeURIComponent(id)}&${encodeURIComponent(selectedAlbum)}`, 
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          editAlbum(selectedAlbum);
        }
      }
    );
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

function search(keyword) {
  let categories = document.getElementsByName('category');
  let resultTable = document.getElementById('table');
  resultTable.innerHTML = `
    <tr id="search-results">
      <th class="row">Song Title</th>
      <th class="row">Artist</th>
      <th class="row">Album</th>
      <th class="row">Year</th>
      <th class="row">Action</th>
    </tr>
  `;
  let category;
  categories.forEach(row => {
    if (row.checked) {
      category = row.value;
    }
  });
  if (keyword.trim() === '') {
    keyword = '.';
  }
  doAjax('GET', `/search/${encodeURIComponent(keyword)}&${encodeURIComponent(category)}`, xhr => {
    let songs = JSON.parse(xhr.responseText);
    songs.map(row => {
      resultTable.innerHTML += `
        <tr>
          <td class="row">${row.title}</td>
          <td class="row">${row.artist}</td>
          <td class="row">${row.album}</td>
          <td class="row">${row.year}</td>
          <td class="row"><button class="btn" onclick="alert('purchased')">Purchase</button></td>
        </tr>
      `;
    });
  });
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
