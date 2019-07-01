const express = require('express');
const PlayersService = require('./players-service');

const PlayersRouter = express.Router();

PlayersRouter.route('/').get((req, res, next) => {
  return PlayersService.getAllPlayers(req.app.get('db'))
    .then(players => {
      if (!players) {
        return res.status(400).json({ error: 'No Players Found' });
      }
      res.json(players);
    })
    .catch(next);
});

PlayersRouter.route('/:group_id').get((req, res, next) => {
  return PlayersService.getPlayersByGroup(
    req.app.get('db'),
    req.params.group_id
  )
    .then(players => {
      if (players.length === 0) {
        return res.status(400).json({ error: 'No group found' });
      }
      res.json(players);
    })
    .catch(next);
});

module.exports = PlayersRouter;
