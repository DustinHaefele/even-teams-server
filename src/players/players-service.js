
const playersService = {

  getAllPlayers(db){
    return db('even_teams_players')
      .select('*');
  },

  getPlayersByGroup(db, group_id) {
    return db('even_teams_players')
      .select('*')
      .where({group_id});
  },
  
  insertPlayer(db, player) {
    return db('even_teams_players')
      .insert(player)
      .returning('*')
      .then(players => players[0]);
  },

  validateGroup(db, group_id){
    return db('even_teams_groups')
      .select('*')
      .where({id: group_id})
      .first();
  },

  deletePlayerById(db, id){
    return db('even_teams_players')
      .where({id})
      .del();
  },

};

module.exports = playersService;