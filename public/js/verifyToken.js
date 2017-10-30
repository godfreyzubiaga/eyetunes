function verifyToken() {
  if (localStorage.getItem('token')) {
    doAjax(
      'GET',
      `/get-user-via-token/`,
      null,
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.available !== false) {
          loadUser(response.id);
          activeUser = response.id;
        } else {
          changeContent('login');
        }
      }
    );
  } else {
    changeContent('login');
  }
}
