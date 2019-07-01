const express = require('express');
const GroupsService = require('./groups-service');

const GroupsRouter = express.Router();

GroupsRouter
  .route('/')
  .get((req,res,next)=>{
    return GroupsService.getAllGroups(req.app.get('db'))
      .then(groups =>{
        if(groups.length === 0){
          return res.status(400).json({error: 'No groups found'});
        }
        res.json(groups);
      }).catch(next);
  });

GroupsRouter
  .route('/:group_id')
  .get((req,res,next)=>{
    return GroupsService.getGroupsById(req.app.get('db'), req.params.group_id)
      .then(group => {
        if(!group) {
          return res.status(400).json({error: 'No group found'});
        }
        res.json(group);
      }).catch(next);
  });

GroupsRouter
  .route('/users/:user_id')
  .get((req,res,next)=>{
    return GroupsService.getGroupsByUserId(req.app.get('db'), req.params.user_id)
      .then(groups=>{
        //May want to return the empty array instead of 400.  Need to think about this a little more.
        if(groups.length === 0){
          return res.status(400).json({error: 'No groups found'});
        }
        res.json(groups);
      }).catch(next);
  });

module.exports = GroupsRouter;