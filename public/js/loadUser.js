function loadUser(id) {
  doAjax('GET', `/get-user/${id}`, null, xhr => {
    const response = JSON.parse(xhr.responseText);
    activeUser = response._id;
    checkLandingPage(response);
  });
}
