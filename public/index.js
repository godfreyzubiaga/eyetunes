let content;
let activeUser;
let regUsernameField;
let regPasswordField;
let mainRow;
let container;
let selectedAlbum = '';
let purchasedSongs = [];
let subscribed;
let price;
let canRegister;

window.onload = () => {
  content = document.getElementById('content');
  verifyToken();
};

function logout() {
  if (localStorage.getItem('token')) {
    activeUser = '';
    localStorage.clear();
    changeContent('login');
  }
}

function verifyToken() {
  doAjax('GET', 
  `/verify-and-get-userId/${encodeURIComponent(localStorage.getItem('token'))}`, 
    xhr => {
      let response = JSON.parse(xhr.responseText);
      if (response.verifiedUser) {
        loadUser(response.id);
        activeUser = response.id;
      } else {
        changeContent('login');
      }
  });
}

function loadUser(id) {
  doAjax('GET', `/get-user/${encodeURIComponent(id)}`, xhr => {
    const response = JSON.parse(xhr.responseText);
      activeUser = response._id;
      checkLandingPage(response);
  });
}

function checkLandingPage(response) {
  if (response.role === 'user' && !response.subscribed) {
    changeContent('subscribe');
  } else {
    changeContent(response.role);
  }
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
    searchForPurchasedSongs();
  } else if (page === 'artist') {
    content.innerHTML = artistHtml();
    let headerText = document.getElementById('headerText');
    let box = document.getElementById('box');
    doAjax('GET', `/get-user/${encodeURIComponent(activeUser)}`, xhr => {
      let user = JSON.parse(xhr.responseText);
      headerText.innerText = `Welcome, ${user.name}`;
      box.innerHTML = '';
      if (user.albums) {
        user.albums.forEach(handleAlbumRow);        
      }
    });

   function handleAlbumRow(albumId) {
      doAjax('GET', `/get-album/${albumId}`, xhr => {
        let album = JSON.parse(xhr.responseText);
        box.innerHTML += `
          <div onclick="editAlbum('${album._id}')" class="albumContainer">
            <div class="album">${album.name}</div>
          </div>
          `;
      });
    }

  } else if (page === 'admin') {
    content.innerHTML = adminHtml();
  } else if (page === 'profile') {
    if (purchasedSongs.length > 0) {
      clearArray();
    }
    content.innerHTML = userProfile();
    table = document.getElementById('table');
    let name = document.getElementById('name');
    doAjax('GET', `/get-user/${encodeURIComponent(activeUser)}`, xhr => {
      let user = JSON.parse(xhr.responseText);
      name.innerText = user.name;
    });

    doAjax('GET', `/get-songs/${encodeURIComponent(activeUser)}`, xhr => {
      let response = JSON.parse(xhr.responseText);
      if (response) {
        let songs = response.list;
        if (songs.length >= 1) {
          let artists = '';
          songs.forEach(row => {
            row.artist.forEach((artist, index) => {
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
        } 
      }
    });
  } else if (page === 'addAlbum') {
    content.innerHTML = addAlbumHtml();
  } else if (page === 'addSong') {
    container.innerHTML = addSongHtml();
  } else if (page === 'subscribe') {
    content.innerHTML = paySubscriptionPage();
    price = document.getElementById('price');
    changePrice('monthly');
  }
}

function searchForPurchasedSongs() {
  doAjax('GET', `/get-songs/${encodeURIComponent(activeUser)}`, xhr => {
    if (xhr.responseText) {
      let songs = JSON.parse(xhr.responseText).list;
      if (songs.length >= 1) {
        songs.forEach(addSongToPurchasedSong);
      }
    }
  }); 

  function addSongToPurchasedSong(row) {
    purchasedSongs.push(row.id);
  }
}

function changePrice(subscriptionType) {
  price.innerText = getSubscriptionPrice(subscriptionType);
}

function editAlbum(id) {
  content.innerHTML = albumHtml();
  selectedAlbum = id;
  container = document.getElementById('main-content');
  let songListTable = document.getElementById('song-list');
  let box = document.getElementById('box');
  let albumName = document.getElementById('album-name');
  let removeBtn;

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
      response.forEach(song => {
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
    alertify.alert('Please fill up the form completely/correctly');
  } else {
    doAjax('POST', `/insert-song/
    ${encodeURIComponent(selectedAlbum)}
    &${encodeURIComponent(title)}
    &${encodeURIComponent(year)}`,
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          alertify.alert('Song was successfully added.');
          editAlbum(selectedAlbum);
        } else {
          alertify.alert('something is wrong');
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
  let token = localStorage.getItem('token');
  if(token) {
    if (albumName) {
      doAjax(
        'POST',
        `/create-album/
          ${encodeURIComponent(albumName)}
          &${encodeURIComponent(activeUser)}
          &${encodeURIComponent(token)}`,
        xhr => {
          let response = JSON.parse(xhr.responseText);
          if (response.success) {
            alertify.alert('Success');
            changeContent('artist');
          } else {
            alertify.alert('Failed');
          }
        }
      );
    }
  }
}

function login(username, password) {
  if (!username || !password) {
    alertify.alert('Please fill up the form completely');
  } else {
    doAjax(
      'GET',
      `/login/${encodeURIComponent(username)}&${encodeURIComponent(password)}`,
      xhr => {
        const response = JSON.parse(xhr.responseText);
        if (response._id) {
          activeUser = response._id;
          checkLandingPage(response);
          localStorage.setItem('token', response.token);
        } else {
          alertify.alert('User not found');
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
  if (password.length < 6 || !username || !password  || !canRegister) {
    alertify.alert('Please fill up all forms completely');
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

function pay(phoneNumber) {
  let subscriptionTypes = document.getElementsByName('subscriptionType');
  let subscriptionType;
  subscriptionTypes.forEach(row => {
    if (row.checked) {
      subscriptionType = row.value;
    }
  });
  if (phoneNumber.length === 10 && String(phoneNumber).charAt(0) === '9') {
    doAjax('POST', `/pay-subscription/
    ${encodeURIComponent(activeUser)}
    &${encodeURIComponent(subscriptionType)}
    &${encodeURIComponent('+63' + phoneNumber)}`,
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          alertify.alert('Subscribed!');
          changeContent('user');
        } else {
          alertify.alert('something is wrong with the server');  
        }
    });
  } else {
    alertify.alert('Your phone number is incorrect');
  }
}

function search(keyword) {
  searchForPurchasedSongs();  
  let resultTable = document.getElementById('table');
  resultTable.innerHTML = `
    <tr id="search-results" style="position: sticky">
      <th class="row">Song Title</th>
      <th class="row">Artist</th>
      <th class="row">Album</th>
      <th class="row">Year</th>
      <th class="row">Action</th>
    </tr>
  `;
  if (keyword === '') {
    keyword = ' ';
  }
  doAjax('GET', `/search/${encodeURIComponent(keyword)}`, xhr => {
    let songs = JSON.parse(xhr.responseText);
    songs.forEach(addSongToResult);

    function addSongToResult(row, index) {
      resultTable.innerHTML += `
        <tr>
          <td class="row">${row.title}</td>
          <td class="row">${row.artist}</td>
          <td class="row">${row.album}</td>
          <td class="row">${row.year}</td>
          <td class="row" id="${row.id}"><button class="btn" onclick="addSongToOwnSongList('${row.id}')">Add Song</button></td>
        </tr>
      `;

      if (index === songs.length - 1) {
        purchasedSongs.forEach(changeActionForPurchasedSong);
      }
    }

    function changeActionForPurchasedSong(id, index) {
      let actionRow = document.getElementById(`${id}`);
      if (actionRow) {
        actionRow.innerHTML = 'Owned';
      }
      if (purchasedSongs.length - 1 === index) {
        clearArray();
      }
    }
  });
}

function clearArray() {
  while (purchasedSongs.length > 0) {
    purchasedSongs.pop();
  }
}

function addSongToOwnSongList(songId) {
  doAjax('POST', `/add-song-to-own-list/${encodeURIComponent(songId)}&${encodeURIComponent(activeUser)}`, handleResponse);
  function handleResponse(xhr) {
    let response = JSON.parse(xhr.responseText);
    if (response.success) {
      alertify.alert('song successfully added to personal list');
      changeContent('profile');
    } else {
      alertify.alert('Something went wrong');
    }
  }
}

function checkIfAvailable(username) {
  if (username === '') {
    regUsernameField.style.borderColor = 'black';
  } else {
    doAjax('GET', `/checkIfAvailable/${encodeURIComponent(username)}`, xhr => {
      let response = JSON.parse(xhr.responseText);
      if (response.available && username.length >= 6) {
        regUsernameField.style.borderColor = 'lightgreen';
        canRegister = true;
      } else {
        (regUsernameField.style.borderColor = 'red');
        canRegister = false;
      }
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
    alertify.alert('Signup success');
    changeContent('login');
  } else {
    alertify.alert('something is wrong with your inputs');
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