const bcrypt = require('bcrypt');
const config = require('../src/config');
const jwt = require('jsonwebtoken');

function makePlayersArray() {
  return [
    {
      id: 1,
      player_name: 'test-name-1',
      player_skill: 1,
      group_id: 1
    },
    {
      id: 2,
      player_name: 'test-name-2',
      player_skill: 2,
      group_id: 1
    },
    {
      id: 3,
      player_name: 'test-name-3',
      player_skill: 3,
      group_id: 1
    },
    {
      id: 4,
      player_name: 'test-name-4',
      player_skill: 4,
      group_id: 2
    },
    {
      id: 5,
      player_name: 'test-name-5',
      player_skill: 5,
      group_id: 2
    }
  ];
}

function makeGroupsArray() {
  return [
    {
      id: 1,
      group_name: 'test-group-1',
      user_id: 1
    },
    {
      id: 3,
      group_name: 'test-group-4',
      user_id: 1
    },
    {
      id: 4,
      group_name: 'test-group-3',
      user_id: 1
    },
    {
      id: 2,
      group_name: 'test-group-2',
      user_id: 2
    }
  ];
}

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'user-name-test-1',
      password: 'password',
      full_name: 'Test FullName1'
    },
    {
      id: 2,
      user_name: 'user-name-test-2',
      password: 'password',
      full_name: 'Test FullName2'
    },
    {
      id: 3,
      user_name: 'user-name-test-3',
      password: 'password',
      full_name: 'Test FullName3'
    },
    {
      id: 4,
      user_name: 'user-name-test-4',
      password: 'password',
      full_name: 'Test FullName4'
    }
  ];
}

function makeTeamsFixtures() {
  const testUsers = makeUsersArray();
  const testPlayers = makePlayersArray();
  const testGroups = makeGroupsArray();
  return { testUsers, testPlayers, testGroups };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE 
    even_teams_players,
    even_teams_groups,
    even_teams_users
    RESTART IDENTITY CASCADE`
  );
}

function seedUsersTable(db, users) {
  const hashedUsers = users.map(user =>({
    ...user, 
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db('even_teams_users')
    .insert(hashedUsers)
    .then(() =>
      db.raw('SELECT setval(\'even_teams_users_id_seq\',?)', [
        users[users.length - 1].id
      ])
    );
}



function seedPlayersTable(db, players) {
  return db('even_teams_players')
    .insert(players)
    .then(() =>
      db.raw('SELECT setval(\'even_teams_players_id_seq\',?)', [
        players[players.length - 1].id
      ])
    );
}

function seedGroupsTable(db, groups){
  return db('even_teams_groups')
    .insert(groups)
    .then(()=>{
      db.raw('SELECT setval(\'even_teams_groups_ib_seq\',?)',[
        groups[groups.length - 1].id
      ]);
    });
}

function makeAuthHeader(user, secret = config.JWT_SECRET) {

  const token = jwt.sign({user_id: user.id}, secret, {
    subject: user.user_name,
    algorithm: 'HS256'});

  return `Bearer ${token}`;
}

module.exports = {
  makeTeamsFixtures,
  cleanTables,
  seedGroupsTable,
  seedPlayersTable,
  seedUsersTable,
  makeAuthHeader
};
