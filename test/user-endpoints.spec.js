/*global expect supertest */

const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const bcrypt = require('bcrypt');

describe('User Endpoints', () => {
  let db;

  const { testPlayers, testUsers, testGroups } = helpers.makeTeamsFixtures();

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

      it('responds 400 and No user found when user_id doesn\'t exist', () => {
        const user_id = 123;
        return supertest(app)
          .get(`/api/users/${user_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(400, { error: 'No user found' });
      }); //it 400

      it('responds with correct user by id', () => {
        const user_id = testUsers[0].id;

        return supertest(app)
          .get(`/api/users/${user_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res=>{
            expect(res.body).to.have.property('id');
            expect(res.body.user_name).to.eql(testUsers[0].user_name);
            expect(res.body.full_name).to.eql(testUsers[0].full_name); 
          })
          .expect(() => {
            db('even_teams_users')
              .select('*')
              .where({ user_name: testUsers[0].user_name })
              .first()
              .then(user => {
                expect(user.user_name).to.eql(testUsers[0].user_name);
                expect(user.full_name).to.eql(testUsers[0].full_name);
                expect(user).to.have.property('id');
                return bcrypt.compare(testUsers[0].password, user.password);
              })
              .then(match => {
                expect(match).to.be.true;
              });
          });
          
      }); //it 200
    }); //context has data
  }); //describe GET path
  describe('POST /api/users/', () => {
    
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

      it('responds 400 and Password can\'t start with a space', () => {
        const { user_name, full_name, password } = testUsers[0];
        const newUser = { user_name, full_name, password };
        newUser.password = ' Password!2';
        return supertest(app)
          .post('/api/users/')
          .send(newUser)
          .expect(400, { error: 'Password can\'t start or end with a space' });
      }); //it 400

      it('responds 400 and Password can\'t end with a space', () => {
        const { user_name, full_name, password } = testUsers[0];
        const newUser = { user_name, full_name, password };
        newUser.password = 'Password!2 ';
        return supertest(app)
          .post('/api/users/')
          .send(newUser)
          .expect(400, { error: 'Password can\'t start or end with a space' });
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
        }); //it
      }); //forEach
      const invalidUsers = [
        {
          full_name: '',
          user_name: 'Test Player1',
          password: 'Password1!'
        },
        {
          full_name: 'test name1',
          user_name: 'Test Player2',
          password: ''
        },
        {
          full_name: 'test name2',
          user_name: '',
          password: 'Password1!'
        }
      ];

      invalidUsers.forEach(user =>{
        it('responds 400 and All fields required when there is a missing field', ()=>{
          return supertest(app)
            .post('/api/users')
            .send(user)
            .expect(400, {error: 'All fields must be given a value'});
        });
      });

      it('responds 400 and Username already exists if it does', () => {
        const newUser = {
          password: 'ValidPass!1',
          full_name: 'Test User',
          user_name: testUsers[0].user_name
        };

        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(400, { error: 'Username Already Exists' });
      });
    }); //context table has data
    context('Happy Path', () => {
      beforeEach('seed users table', () => {
        return helpers.seedUsersTable(db, testUsers);
      });
      beforeEach('seed groups table', () => {
        return helpers.seedGroupsTable(db, testGroups);
      });
      beforeEach('seed players table', () => {
        return helpers.seedPlayersTable(db, testPlayers);
      });
      
      it('Happy Path', () => {
        const newUser = {
          password: 'ValidPass!1',
          full_name: 'Harry Potter',
          user_name: 'harrypotter'
        };

        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.user_name).to.eql(newUser.user_name);
            expect(res.body.full_name).to.eql(newUser.full_name);
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          })
          .expect(() => {
            db('even_teams_users')
              .select('*')
              .where({ user_name: newUser.user_name })
              .first()
              .then(user => {
                expect(user.user_name).to.eql(newUser.user_name);
                expect(user.full_name).to.eql(newUser.full_name);
                expect(user).to.have.property('id');
                return bcrypt.compare(newUser.password, user.password);
              })
              .then(match => {
                expect(match).to.be.true;
              });
          });
      }); //it happy path
    }); //context happy path
  }); //describe POST path
  describe('GET /api/users/user_name', () => {
    beforeEach('seed users table', () => {
      return helpers.seedUsersTable(db, testUsers);
    });

    const expected = testUsers.map(user => {return {full_name: user.full_name, user_name: user.user_name, id: user.id}})

    it('returns 200 and correct users', ()=>{
      const searchTerm = 'test'
      // const body = { searchTerm }
      return supertest(app)
        .get(`/api/users/user_name?searchTerm=${searchTerm}`)
        // .send(body)
        .expect(200, expected)
    });
  }); //describe search user_name
  describe('GET /api/users/full_name', () => {
    beforeEach('seed users table', () => {
      return helpers.seedUsersTable(db, testUsers);
    });

    it('returns 200 and correct users', ()=>{
      const searchTerm = 'Name3'
       // const body = { searchTerm }
      return supertest(app)
        .get(`/api/users/full_name?searchTerm=${searchTerm}`)
        // .send(body)
        .expect(200, [{full_name: testUsers[2].full_name, user_name: testUsers[2].user_name, id: testUsers[2].id}]);
    });
  }); //describe search full_name
}); //main describe
