const express = require('express');
const UsersService = require('./users-service');
const UsersRouter = express.Router();

UsersRouter
  .route('/:user_id')
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

