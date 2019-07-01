
const playersService = {

  getAllPlayers(db){
    return db('even_teams_players')
      .select('*');
  },

  getPlayersByGroup(db, group_id) {
    return db('even_teams_players')
      .select('*')
      .where({group_id});
  }

};

module.exports = playersService;