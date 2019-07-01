
const GroupsService = {
  getGroupsByUserId(db, user_id){
    return db('even_teams_groups')
      .select('*')
      .where({user_id});
  },
  getGroupsById(db, id){
    return db('even_teams_groups')
      .select('*')
      .where({id})
      .first();
  },
  getAllGroups(db){
    return db('even_teams_groups')
      .select('*');
  },
  insertGroup(db, group){
    return db('even_teams_groups')
      .insert(group)
      .returning('*')
      .then(groups=>groups[0]);
  },
  validateUser(db, user_id){
    return db('even_teams_users')
      .select('*')
      .where({id: user_id})
      .first()
      .then(user => !!user);
  }
};

module.exports = GroupsService;