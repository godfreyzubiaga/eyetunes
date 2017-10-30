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