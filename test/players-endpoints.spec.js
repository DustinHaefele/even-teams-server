const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Players Endpoints', () =>{
  let db;

  const {
    testPlayers, 
    testUsers,
    testGroups
  } = helpers.makeThingsFixtures();

  before('make knex instance', ()=> {
    db = knex({
      client:'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db',db);
  });
  after('disconnect from db',()=>db.destroy());

  before('cleanup',()=>helpers.cleanTables(db));

  afterEach('cleanup',()=>helpers.cleanTables(db));

  describe('GET /api/players',()=>{
    beforeEach('seed users table',()=>{
      return helpers.seedUsersTable(db, testUsers);
    });
    beforeEach('seed groups table',()=>{
      return helpers.seedGroupsTable(db, testGroups);
    });
    beforeEach('seed players table',()=>{
      return helpers.seedPlayersTable(db, testPlayers);
    });

    it('gets all players', ()=>{
      return supertest(app)
        .get('/api/players')
        .expect(200, testPlayers);
    });

  });//describe api/players

});//main describe