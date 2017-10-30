let decodedId;
module.exports = {
  validateToken: (response, token, jwt) => {
    let valid;
    jwt.verify(getToken(token), 'eyetunessecret', (error, decoded) => {
      if (!error) {
        decodedId = decoded.id;
        valid = true;
      } else {
        valid = false;
      }
    });
    return valid;
  },

  getDecodedId: () => {
    return decodedId;
  }
};

function getToken(token) {
  return token.slice(7);
}