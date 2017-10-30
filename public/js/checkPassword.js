function passwordCheck(password) {
  if (password === '') {
    regPasswordField.style.borderColor = 'black';
  } else {
    password.length >= 6
      ? (regPasswordField.style.borderColor = 'lightgreen')
      : (regPasswordField.style.borderColor = 'red');
  }
}
