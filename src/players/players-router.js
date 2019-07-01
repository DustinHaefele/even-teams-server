const express = require('express');
const PlayersService = require('./players-service');
const path = require('path');

const PlayersRouter = express.Router();
const jsonBodyParser = express.json();

PlayersRouter.route('/')
  .get((req, res, next) => {
    return PlayersService.getAllPlayers(req.app.get('db'))
      .then(players => {
        if (!players) {
          return res.status(400).json({ error: 'No Players Found' });
        }
        res.json(players);
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { player_name, player_skill, group_id } = req.body;
    const player = { player_name, player_skill, group_id };

    return PlayersService.validateGroup(req.app.get('db'), group_id).then(
      groupExists => {
        if (!groupExists) {
          return res.status(400).json({ error: 'Group not found' });
        }
        return PlayersService.insertPlayer(req.app.get('db'), player).then(
          player => {
            if (!player) {
              return res.status(400).json({ error: 'Somthing went wrong' });
            }
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${player.id}`))
              .json(player);
          }
        );
      }
    ).catch(next);
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
