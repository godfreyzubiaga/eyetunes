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
    doAjax('GET', `/get-user/${activeUser}`, null, xhr => {
      let response = JSON.parse(xhr.responseText);
      if (response.available !== false) {
        headerText.innerText = `Welcome, ${response.name}`;
        box.innerHTML = '';
        response.albums.forEach(handleAlbumRow);
      } else {
        alertify('Something Went Wrong');
      }
    });

    function handleAlbumRow(albumId) {
      doAjax('GET', `/get-album/${albumId}`, null, xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.available !== false) {
          box.innerHTML += `
          <div onclick="editAlbum('${response._id}')" class="albumContainer">
            <div class="album">${response.name}</div>
          </div>
          `;
        }
      });
    }
  } else if (page === 'admin') {
    content.innerHTML = adminHtml();
  } else if (page === 'profile') {
    content.innerHTML = userProfile();
    table = document.getElementById('table');
    let name = document.getElementById('name');
    doAjax('GET', `/get-user/${activeUser}`, null, xhr => {
      let user = JSON.parse(xhr.responseText);
      name.innerText = user.name;
    });

    doAjax('GET', `/get-songs/${activeUser}`, null, xhr => {
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
