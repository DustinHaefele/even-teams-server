const express = require('express');
const path = require('path');
const GroupsService = require('./groups-service');
const GroupsRouter = express.Router();
const {requireAuth} = require('../middleware/jwt-auth');

const jsonBodyParser = express.json();

GroupsRouter.route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    return GroupsService.getAllGroups(req.app.get('db'))
      .then(groups => {
        return res.json(groups);
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const {group_name, user_id} = req.body;
    const group = {group_name, user_id};

    if(!group_name || !user_id){
      return res.status(400).json({error: 'All fields must be given a value'});
    }

    return GroupsService.validateUser(req.app.get('db'), req.body.user_id)
      .then(userExists => {
        if (!userExists) {
          return res.status(400).json({ error: 'User does not exist' });
        }

        return GroupsService.insertGroup(
          req.app.get('db'),
          group
        ).then(insertedGroup => {
          if(!insertedGroup){
            return res.status(400).json({error:'something went wrong'});
          }
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `${insertedGroup.id}`))
            .json(insertedGroup);
        });
      }).catch(next);
  });

GroupsRouter.route('/:group_id').get(requireAuth, (req, res, next) => {
  return GroupsService.getGroupsById(req.app.get('db'), req.params.group_id)
    .then(group => {
      if (!group) {
        return res.status(400).json({ error: 'No group found' });
      }
      return res.json(group);
    })
    .catch(next);
});

GroupsRouter.route('/users/:user_id').get(requireAuth, (req, res, next) => {
  return GroupsService.getGroupsByUserId(req.app.get('db'), req.params.user_id)
    .then(groups => {

      return res.json(groups);
    })
    .catch(next);
});

module.exports = GroupsRouter;
