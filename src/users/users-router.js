const express = require('express');
const path = require('path');
const UsersService = require('./users-service');
const UsersRouter = express.Router();
const {requireAuth} = require('../middleware/jwt-auth');
const jsonBodyParser = express.json();

UsersRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { user_name, full_name, password } = req.body;
  const user = { user_name, full_name, password };

  if(!user_name || !password || !full_name){
    return res.status(400).json({error: 'All fields must be given a value'});
  }
  const passError = UsersService.validatePassword(password);

  if (passError) {
    return res.status(400).json({ error: passError });
  }

  UsersService.validateUserName(req.app.get('db'), user_name)
    .then(userInDb => {
      if (userInDb) {
        return res.status(400).json({ error: 'Username Already Exists' });
      }
      return UsersService.hashPassword(password).then(hashPass => {
        user.password = hashPass;

        return UsersService.insertUser(req.app.get('db'), user).then(insertedUser => {
          
          if (!insertedUser) {
            return res.status(400).json({ error: 'Somthing went wrong' });
          }

          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${insertedUser.id}`))
            .json(UsersService.serializeUser(insertedUser));
        });
      });

    }).catch(next);
});

UsersRouter.get('/user_name', (req ,res ,next) => {
   return UsersService.findUserName(req.app.get('db'), req.query.searchTerm)
    .then(users => {
      if (!users) {
        return res.status(400).json({ error: 'No users found' });
      }
      return res.status(200).json(users);
    })
    .catch(next);
  });

  UsersRouter.get('/full_name', jsonBodyParser, (req ,res ,next) => {
     return UsersService.findFullName(req.app.get('db'), req.query.searchTerm)
      .then(users => {
        if (!users) {
          return res.status(400).json({ error: 'No users found' });
        }
        return res.status(200).json(users);
      })
      .catch(next);
    });

UsersRouter.route('/:user_id')
  .get(requireAuth, (req, res, next) => {
    UsersService.getUserById(req.app.get('db'), req.params.user_id)
      .then(user => {
        if (!user) {
          return res.status(400).json({ error: 'No user found' });
        }
        res.status(200).json(user);
      })
      .catch(next);
  });



module.exports = UsersRouter;
