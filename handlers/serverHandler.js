const { validateToken, getDecodedId } = require('./validateToken');
module.exports = {
  usernameAvailability: (response, username, db) => {
    if (username !== null) {
      db.collection('users').findOne({ username: username }, handleUserResult);
      function handleUserResult(error, results) {
        if (results !== null) {
          results.username === username
            ? response.status(403).json({ available: false })
            : response.json(200).json({ available: true });
        } else {
          response.status(200).json({ available: true });
        }
      }
    } else {
      response.status(400).json({ available: true });
    }
  },

  register: (response, data, db, bcrypt) => {
    let name = data.name;
    let username = data.username;
    let password = data.password;
    let role = data.role;
    let user = {
      name: '',
      username: '',
      role: '',
      password: ''
    };

    if (!name || !username || !password || !role || password.length < 6) {
      response.status(403).json({ success: false });
    } else {
      bcrypt.genSalt(12, (error, salt) => {
        bcrypt.hash(password, salt, handleEncryptedPassword);
      });
    }

    function handleEncryptedPassword(error, encryptedPassword) {
      db
        .collection('users')
        .findOne({ username: username }, (error, result) => {
          if (result === null || !result.username) {
            user.name = name;
            user.username = username;
            user.role = role;
            user.password = encryptedPassword;
            if (role === 'user') {
              user.subscribed = false;
            }
            db.collection('users').insert(user, handleInsertResponse);
          } else {
            response.status(403).json({ success: false });
          }
        });
    }

    function handleInsertResponse(error) {
      if (!error) {
        response.status(200).json({ success: true });
      } else {
        response.status(403).json({ success: false });
      }
    }
  },

  login: (response, data, db, jwt, bcrypt) => {
    let username = data.username;
    let password = data.password;
    let result;
    db.collection('users').findOne(
      {
        username: {
          $regex: `${username}`,
          $options: 'i'
        }
      },
      handleUserResult
    );

    function handleUserResult(error, dbResult) {
      if (dbResult !== null) {
        result = dbResult;
        bcrypt.compare(password, dbResult.password, handleSamePassword);
      } else {
        response.status(404).json({ available: false });
      }
    }

    function handleSamePassword(error, samePassword) {
      if (samePassword) {
        let id = result._id;
        jwt.sign({ id }, 'eyetunessecret', (error, heresTheToken) => {
          result.token = heresTheToken;
          response.status(200).json(result);
        });
      } else {
        response.status(404).json({ available: false });
      }
    }
  },

  getUserIdViaToken: (response, data, jwt) => {
    if (validateToken(response, data, jwt)) {
      response.status(200).json({ id: getDecodedId() });
    } else {
      response.status(401).json({ available: false });
    }
  },

  getUser: (response, db, data, ObjectId) => {
    let userId = data;
    db.collection('users').findOne({ _id: ObjectId(userId) }, handleUserResult);

    function handleUserResult(error, result) {
      if (!error) {
        response.status(200).json(result);
      } else {
        response.status(404).json({ available: false });
      }
    }
  }
};
