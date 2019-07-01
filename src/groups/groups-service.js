
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
  }
};

module.exports = GroupsService;