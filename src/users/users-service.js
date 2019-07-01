
const UsersService = {
  getUserById(db, id){
    return db('even_teams_users')
      .select('*')
      .where({id})
      .first();
  },

};

module.exports = UsersService;