const express = require('express');
const PlayersService = require('./players-service');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');

const PlayersRouter = express.Router();
const jsonBodyParser = express.json();

PlayersRouter.route('/')
  .get(requireAuth, (req, res, next) => {
    return PlayersService.getAllPlayers(req.app.get('db'))
      .then(players => {
        if (!players) {
          return res.status(400).json({ error: 'No Players Found' });
        }
        res.json(players);
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { player_name, player_skill, group_id, user_id } = req.body;
    const player = { player_name, player_skill, group_id, user_id };

    if (!player_name || !player_skill || !group_id) {
      return res
        .status(400)
        .json({ error: 'All fields must be given a value' });
    }

    return PlayersService.validateGroup(req.app.get('db'), group_id)
      .then(group => {
        if (!group) {
          return res.status(400).json({ error: 'Group not found' });
        }
        if (group.user_id !== req.user.id) {
          return res.status(401).json({
            error: 'You aren\'t authorized to make changes to this group'
          });
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
      })
      .catch(next);
  });

PlayersRouter.route('/:group_id').get(requireAuth, (req, res, next) => {
  return PlayersService.getPlayersByGroup(
    req.app.get('db'),
    req.params.group_id
  )
    .then(players => {
      return res.json(players);
    })
    .catch(next);
});

PlayersRouter.route('/:group_id/:player_id').delete(
  requireAuth,
  (req, res, next) => {
    return PlayersService.validateGroup(req.app.get('db'), req.params.group_id).then(
      group => {
        if (!group) {
          return res.status(400).json({ error: 'Group not found' });
        }
        if (group.user_id !== req.user.id) {
          return res.status(401).json({
            error: 'You aren\'t authorized to make changes to this group'
          });
        }
        return PlayersService.deletePlayerById(
          req.app.get('db'),
          req.params.player_id
        )
          .then(() => {
            return res.status(204).end();
          })
          .catch(next);
      });
  });

module.exports = PlayersRouter;
