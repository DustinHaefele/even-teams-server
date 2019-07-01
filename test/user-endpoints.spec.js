const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('User Endpoints', () => {
  let db;

  const { testPlayers, testUsers, testGroups } = helpers.makeThingsFixtures();

  before('create knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/users/:user_id', () => {
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

      it("responds 400 and No user found when user_id doesn't exist", () => {
        const user_id = 123;
        return supertest(app)
          .get(`/api/users/${user_id}`)
          .expect(400, { error: 'No user found' });
      }); //it 400

      it('responds with correct user by id', () => {
        const user_id = testUsers[0].id;

        return supertest(app)
          .get(`/api/users/${user_id}`)
          .expect(200, testUsers[0]);
      }); //it 200
    }); //context has data
  }); //describe GET path
  describe('POST /api/users/', () => {
    context('table has no data', () => {
      it('responds 400 and password must be > 8 characters with short password', () => {
        const { user_name, full_name, password } = testUsers[0];
        const newUser = { user_name, full_name, password };
        newUser.password = '2Short!';
        return supertest(app)
          .post('/api/users/')
          .send(newUser)
          .expect(400, { error: 'Password must be at least 8 characters' });
      }); //it 400

      it('responds 400 and password must be < 73 characters with short password', () => {
        const { user_name, full_name, password } = testUsers[0];
        const newUser = { user_name, full_name, password };
        newUser.password = 'p'.repeat(73);
        return supertest(app)
          .post('/api/users/')
          .send(newUser)
          .expect(400, { error: 'Password must be less than 73 characters' });
      }); //it 400

      it("responds 400 and Password can't start with a space", () => {
        const { user_name, full_name, password } = testUsers[0];
        const newUser = { user_name, full_name, password };
        newUser.password = ' Password!2';
        return supertest(app)
          .post('/api/users/')
          .send(newUser)
          .expect(400, { error: "Password can't start or end with a space" });
      }); //it 400

      it("responds 400 and Password can't end with a space", () => {
        const { user_name, full_name, password } = testUsers[0];
        const newUser = { user_name, full_name, password };
        newUser.password = 'Password!2 ';
        return supertest(app)
          .post('/api/users/')
          .send(newUser)
          .expect(400, { error: "Password can't start or end with a space" });
      }); //it 400

      const badPasswords = [
        'NOLOWERS1!',
        'nouppers1!',
        'Nospecials1',
        'Nonumbers!'
      ];

      badPasswords.forEach(pass => {
        const { user_name, full_name, password } = testUsers[0];
        const newUser = { user_name, full_name, password };
        newUser.password = pass;
        it('responds with 400 and password needs 1 special character, 1 uppercase letter, 1 lowercase letter, and 1 number', () => {
          return supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(400, {
              error:
                'password needs 1 special character, 1 uppercase letter, 1 lowercase letter, and 1 number'
            });
        });//it
      });//forEach

      //forEach Regex checks here..
    }); //context has no data
  }); //describe POST path
}); //main describe
