const knex = require('knex');
const helpers = require('./test-helpers');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

describe('Auth Endpoints', () => {
  let db;

  const { testUsers } = helpers.makeTeamsFixtures();
  const testUser = testUsers[0];

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

  describe('POST /api/login', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsersTable(db, testUsers);
    });

    context('missing information', () => {
      it('responds with 400 required error when User is missing', () => {
        const missingUser = { user_name: '', password: 'password' };

        return supertest(app)
          .post('/api/login')
          .send(missingUser)
          .expect(400, {
            error: `Missing Credentials`
          });
      });

      it('responds with 400 required error when password is missing', () => {
        const missingPassword = { user_name: testUser.user_name, password: '' };
        return supertest(app)
          .post('/api/login')
          .send(missingPassword)
          .expect(400, {
            error: `Missing Credentials`
          });
      });
    });

    context('information provided', () => {
      it("responds 401 if username isn't valid", () => {
        const fakeUser = {user_name: 'notauser', password: 'notapassword'}

        return supertest(app)
          .post('/api/login')
          .send(fakeUser)
          .expect(401, {
            error: `Invalid Credentials`
          });
      });
      it("responds 401 if password isn't valid", () => {
        const badPassword = {user_name: testUser.user_name, password: 'notapassword'}

        return supertest(app)
          .post('/api/login')
          .send(badPassword)
          .expect(401, {
            error: `Invalid Credentials`
          });
      });

      it('responds 200 with a jwt token when valid credentials sent',()=>{
        
        const expectedToken = jwt.sign({user_id: testUser.id}, config.JWT_SECRET, {subject: testUser.user_name});

        

        return supertest(app)
          .post('/api/login')
          .send({user_name: testUser.user_name, password: testUser.password})
          .expect(200, {authToken: expectedToken});
      });
    });
  });
});
