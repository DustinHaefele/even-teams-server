const express = require('express');
const PlayersService = require('./players-service');

const PlayersRouter = express.Router();

PlayersRouter.route('/').get((req, res, next) => {
  PlayersService.getAllPlayers(req.app.get('db'))
    .then(players => {
      if (!players) {
        res.status(400).send({error: 'No Players Found'});
      }
      res.json(players);
    })
    .catch(next);
});

PlayersRouter
  .route('/:group_id')
  .get((req,res,next)=>{
    return PlayersService.getPlayersByGroup(req.app.get('db'), req.params.group_id)
      .then(players=>{
        if(!players){
          return res.status(400).send({error: 'No Players Found'});
        }
        res.json(players);
      }).catch(next);
  });

  module.exports = PlayersRouter;

