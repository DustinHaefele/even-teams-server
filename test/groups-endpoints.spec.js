const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Groups Endpoints', () => {
  let db;

  const { testPlayers, testUsers, testGroups } = helpers.makeThingsFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('/api/groups/', () => {
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

      it('returns all groups', () => {
        return supertest(app)
          .get('/api/groups')
          .expect(200, testGroups);
      }); //it

      it('gets group by id', () => {
        const group_id = testGroups[1].id;
        const expectedGroup = testGroups[1];
        return supertest(app)
          .get(`/api/groups/${group_id}`)
          .expect(200, expectedGroup);
      }); //it

      it("responds 400 and no group found when group doesn't exist", () => {
        const group_id = 123;
        return supertest(app)
          .get(`/api/groups/${group_id}`)
          .expect(400, { error: 'No group found' });
      }); //it
    }); //context table has data
  }); //describe path

  describe('/api/groups/users/:user_id', () => {
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

      it('responds 200 with users groups', () => {
        const user_id = testUsers[0].id;
        const expectedGroups = testGroups.filter(
          group => user_id === group.user_id
        );
        return supertest(app)
          .get(`/api/groups/users/${user_id}`)
          .expect(200, expectedGroups);
      }); //it 200

      it('responds 400 when no groups found', () => {
        const user_id = 123;

        return supertest(app)
          .get(`/api/groups/users/${user_id}`)
          .expect(400, { error: 'No groups found' });
      });
    }); //context with data
  }); //describe user id path
}); //main describe
