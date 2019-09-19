const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');



const AuthService = {
  getUserWithUserName(db, user_name) {

    user_name = user_name.toLowerCase();

    return db('even_teams_users')
      .where({ user_name })
      .first();
  },

  verifyPassword(password, hashedPass){
    return bcrypt.compare(password, hashedPass);
  },

  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256',
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {algorithms: ['HS256']});
  }
};

module.exports = AuthService;