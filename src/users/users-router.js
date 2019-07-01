const express = require('express');
const UsersService = require('./users-service');
const UsersRouter = express.Router();

const jsonBodyParser = express.json();

UsersRouter
  .post('/', jsonBodyParser, (req,res,next)=>{
    const {user_name, full_name, password} = req.body;
    const user = {user_name, full_name, password};

    const passError = UsersService.validatePassword(password);

    if(passError){
      return res.status(400).json({error: passError});
    }

    UsersService.validateUserName(req.app.get('db'), user_name)
      .then(userInDb =>{
        if(userInDb){
          return res.status(400).json({error: 'Username Already Exists'});
        }
        res.send('ok');
      });
  });

UsersRouter
  .route('/:user_id')
  //might want to delete this route.
  .get((req,res,next)=>{
    UsersService.getUserById(req.app.get('db'),req.params.user_id)
      .then(user =>{
        if(!user){
          return res.status(400).json({error: 'No user found'});
        }
        res.json(user);
      }).catch(next);
  });

module.exports = UsersRouter;

