
const playersService = {

  getAllPlayers(db){
    return db('even-teams-users')
      .select('*');
  },

  getPlayersByGroup(db, group_id) {
    return db('even-teams-users')
      .select('*')
      .where({group_id});
  }

};