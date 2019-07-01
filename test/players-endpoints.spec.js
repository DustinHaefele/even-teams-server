const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Players Endpoints', () =>{
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
    });//it

    it('gets players with a given group id', () =>{
      const groupId = testPlayers[0].group_id;
      const expectedPlayers = testPlayers.filter(player => player.group_id === groupId);
      return supertest(app)
        .get(`/api/players/${groupId}`)
        .expect(200, expectedPlayers);
    });

    it('returns 400 and no group found if id doesn\'t exist', ()=>{
      const invalidId = 123;
      return supertest(app)
        .get(`/api/players/${invalidId}`)
        .expect(400, {error: 'No group found'});
    });



  });//describe api/players

});//main describe