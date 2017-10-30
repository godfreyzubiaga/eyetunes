function login(username, password) {
  if (!username || !password) {
    alertify.alert('Please fill up the form completely');
  } else {
    doAjax('GET', `/login/${username}&${password}`, null, xhr => {
      const response = JSON.parse(xhr.responseText);
      if (response.available !== false) {
        alertify.success('Login successfully');
        activeUser = response._id;
        checkLandingPage(response);
        localStorage.setItem('token', response.token);
      } else {
        alertify.error('User not found');
      }
    });
  }
}
