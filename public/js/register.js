function register(name, username, password) {
  let roleOptions = document.getElementsByName('role');
  let role;
  roleOptions.forEach(row => {
    if (row.checked) {
      role = row.value;
    }
  });
  if (password.length < 6 || !username || !password || !canRegister) {
    alertify.alert('Please fill up all forms completely');
  } else {
    doAjax(
      'POST',
      `/register`, {
        name: name,
        username: username,
        password: password,
        role: role
      },
      showSuccess
    );
  }
}