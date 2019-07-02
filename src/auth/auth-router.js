const express = require('express');
const AuthService = require('./auth-service');

const jsonBodyParser = express.json();

const AuthRouter = express.Router();

AuthRouter.route('/').post(jsonBodyParser, (req, res, next) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(400).json({
      error: `Missing Credentials`
    });
  }

  AuthService.getUserWithUserName(req.app.get('db'), user_name)
    .then(user => {
      if (!user) {
        return res.status(401).json({
          error: `Invalid Credentials`
        });
      }

      AuthService.verifyPassword(password, user.password).then(match => {
        if (!match) {
          return res.status(401).json({
            error: `Invalid Credentials`
          });
        }
        const subject = user.user_name;
        const payload = {user_id: user.id};
        res.send({
          authToken: AuthService.createJwt(subject, payload)
        });
      });
    })
    .catch(next);
});

module.exports = AuthRouter;
