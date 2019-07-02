/*global expect supertest */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Groups Endpoints', () => {
  let db;

  const { testPlayers, testUsers, testGroups } = helpers.makeTeamsFixtures();

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

      it('responds 400 and no group found when group doesn\'t exist', () => {
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
  }); //describe GET user id path
  describe('POST /api/groups',()=>{
    context('table has data',()=>{
      beforeEach('seed users table', () => {
        return helpers.seedUsersTable(db, testUsers);
      });
      beforeEach('seed groups table', () => {
        return helpers.seedGroupsTable(db, testGroups);
      });
      beforeEach('seed players table', () => {
        return helpers.seedPlayersTable(db, testPlayers);
      });

      it('Responds 400 and User doesn\'t exist if user doesn\'t',()=>{
        const newGroup =  {
          user_id:123,
          group_name: 'Test Group'
        };
        return supertest(app)
          .post('/api/groups')
          .send(newGroup)
          .expect(400, {error:'User does not exist'});
      });

      const invalidGroups = [
        {
          user_id: '',
          group_name: 'Test Group',
        },
        {
          user_id: 1,
          group_name: '',
        }
      ];

      invalidGroups.forEach(group =>{
        it('responds 400 and All fields required when there is a missing field', ()=>{
          return supertest(app)
            .post('/api/groups')
            .send(group)
            .expect(400, {error: 'All fields must be given a value'});
        });
      });
      
    });//context
    context('happy path',()=>{
      beforeEach('seed users table', () => {
        return helpers.seedUsersTable(db, testUsers);
      });

      it('responds 201 and location and group info when posted',()=>{
        const newGroup = {
          group_name: 'Hogwarts Pickup Quidditch',
          user_id: testUsers[0].id
        };

        return supertest(app)
          .post('/api/groups')
          .send(newGroup)
          .expect(201)
          .expect(res=>{
            expect(res.body).to.have.property('id');
            expect(res.body.group_name).to.eql(newGroup.group_name);
            expect(res.body.user_id).to.eql(newGroup.user_id);
            expect(res.headers.location).to.eql(`/api/groups/${res.body.id}`)
          })
          .expect(res=>{
            db('even_teams_groups')
              .select('*')
              .where({id: res.body.id})
              .first()
              .then(row=>{
                expect(row.group_name).to.eql(newGroup.group_name);
                expect(row.user_id).to.eql(newGroup.user_id);
                expect(row).to.have.property('id');
              });
          });
      });//it happy path
    });//context happy path
  });//describe POST path
}); //main describe
