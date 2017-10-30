function logout() {
  activeUser = '';
  localStorage.clear();
  changeContent('login');
}
