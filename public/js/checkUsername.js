function checkIfAvailable(username) {
  if (username === '') {
    regUsernameField.style.borderColor = 'black';
  } else {
    if (username.length >= 6) {
      doAjax(
        'GET',
        `/check-username-availability/${username}`, null,
        xhr => {
          let response = JSON.parse(xhr.responseText);
          if (response.available) {
            regUsernameField.style.borderColor = 'lightgreen';
            canRegister = true;
          } else {
            regUsernameField.style.borderColor = 'red';
            canRegister = false;
          }
        }
      );
    } else {
      regUsernameField.style.borderColor = 'red';
      canRegister = false;
    }
  }
}
