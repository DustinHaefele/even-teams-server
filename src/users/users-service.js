const bcrypt = require('bcrypt');
const xss = require('xss');

// eslint-disable-next-line no-useless-escape
const REGEX_PASS = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;


const UsersService = {
  getUserById(db, id){
    return db('even_teams_users')
      .select('*')
      .where({id})
      .first();
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 73 characters';
    }
    if (password[0] === ' ' || password[password.length - 1] === ' ') {
      return 'Password can\'t start or end with a space';
    }
    if (!REGEX_PASS.test(password)) {
      return 'password needs 1 special character, 1 uppercase letter, 1 lowercase letter, and 1 number';
    }

    return null;
  },

  validateUserName(db, user_name) {

    user_name = user_name.toLowerCase();

    return db('even_teams_users')
      .where({user_name})
      .first()
      .then(userInDb => !!userInDb);
  },

  hashPassword(password){
    return bcrypt.hash(password, 10);
  },

  serializeUser(user){
    const {user_name, password, full_name, id} = user;

    return {
      user_name: xss(user_name),
      full_name: xss(full_name),
      password,
      id,
    };
  },

  insertUser(db, user){

    user.user_name = user.user_name.toLowerCase();

    return db('even_teams_users')
      .insert(user)
      .returning('*')
      .then(users=>users[0]);
  }
};

module.exports = UsersService;