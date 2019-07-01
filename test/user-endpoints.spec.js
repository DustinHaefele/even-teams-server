const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');


describe.only('User Endpoints', ()=>{
  let db;

  const { testPlayers, testUsers, testGroups } = helpers.makeThingsFixtures();

  before('create knex instance',()=>{
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db',db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('/api/users/:user_id',()=>{
    context('table has data', () => {
      beforeEach('seed users table', () => {
        return helpers.seedUsersTable(db, testUsers);
      });
      beforeEach('seed groups table', () => {
        return helpers.seedGroupsTable(db, testGroups);
      });
      beforeEach('seed players table', () => {
        return helpers.seedPlayersTable(db, testPlayers);
      });

      it('responds 400 and No user found when user_id doesn\'t exist', ()=>{
        const user_id = 123;
        return supertest(app)
          .get(`/api/users/${user_id}`)
          .expect(400, {error: 'No user found'});
      });//it 400

      it('responds with correct user by id',()=>{
        const user_id = testUsers[0].id;

        return supertest(app)
          .get(`/api/users/${user_id}`)
          .expect(200, testUsers[0]);
      });//it 200
    });//context has data
  });//describe path
});//main describe