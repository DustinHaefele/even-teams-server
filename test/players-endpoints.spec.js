/*global expect supertest */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Players Endpoints', () => {
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

  describe('GET /api/players', () => {
    beforeEach('seed users table', () => {
      return helpers.seedUsersTable(db, testUsers);
    });
    beforeEach('seed groups table', () => {
      return helpers.seedGroupsTable(db, testGroups);
    });
    beforeEach('seed players table', () => {
      return helpers.seedPlayersTable(db, testPlayers);
    });

    it('gets all players', () => {
      return supertest(app)
        .get('/api/players')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, testPlayers);
    }); //it

    it('gets players with a given group id', () => {
      const groupId = testPlayers[0].group_id;
      const expectedPlayers = testPlayers.filter(
        player => player.group_id === groupId
      );
      return supertest(app)
        .get(`/api/players/${groupId}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, expectedPlayers);
    });

    it('returns 400 and no group found if id doesn\'t exist', () => {
      const invalidId = 123;
      return supertest(app)
        .get(`/api/players/${invalidId}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, []);
    });
  }); //GET describe api/players
  describe('POST /api/players', () => {
    context('POST fails', () => {
      beforeEach('seed users table', () => {
        return helpers.seedUsersTable(db, testUsers);
      });
      beforeEach('seed groups table', () => {
        return helpers.seedGroupsTable(db, testGroups);
      });
      beforeEach('seed players table', () => {
        return helpers.seedPlayersTable(db, testPlayers);
      });
      it('responds 400 and Invalid group if group_id isn\'t valid', () => {
        const newPlayer = {
          group_id: 123,
          player_name: 'Test Player',
          player_skill: 4
        };

        return supertest(app)
          .post('/api/players')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newPlayer)
          .expect(400, { error: 'Group not found' });
      });
      const invalidPlayers = [
        {
          group_id: '',
          player_name: 'Test Player1',
          player_skill: 4
        },
        {
          group_id: 1,
          player_name: 'Test Player2',
          player_skill: ''
        },
        {
          group_id: 1,
          player_name: '',
          player_skill: 4
        }
      ];

      invalidPlayers.forEach(player =>{
        it('responds 400 and All fields required when there is a missing field', ()=>{
          return supertest(app)
            .post('/api/players')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(player)
            .expect(400, {error: 'All fields must be given a value'});
        });

        it('responds 401 and you arent authorized to make changes if user doesnt match group owner',()=>{
          const newPlayer = {
            group_id: 1,
            player_name: 'Test Player',
            player_skill: 4
          };
  
          return supertest(app)
            .post('/api/players')
            .set('Authorization', helpers.makeAuthHeader(testUsers[3]))
            .send(newPlayer)
            .expect(401, { error: 'You aren\'t authorized to make changes to this group' });
        });
      });
      
    }); //context POST FAILS
    context('happy path', () => {
      beforeEach('seed users table', () => {
        return helpers.seedUsersTable(db, testUsers);
      });
      beforeEach('seed groups table', () => {
        return helpers.seedGroupsTable(db, testGroups);
      });
      beforeEach('seed players table', () => {
        return helpers.seedPlayersTable(db, testPlayers);
      });

      it('responds 201 and location and group info when posted', () => {
        const newPlayer = {
          player_name: 'Harry Potter',
          player_skill: 5,
          group_id: testGroups[0].id
        };

        return supertest(app)
          .post('/api/players')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newPlayer)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.player_name).to.eql(newPlayer.player_name);
            expect(res.body.group_id).to.eql(newPlayer.group_id);
            expect(res.headers.location).to.eql(`/api/players/${res.body.id}`);
          })
          .expect(res => {
            db('even_teams_players')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.player_name).to.eql(newPlayer.player_name);
                expect(row.group_id).to.eql(newPlayer.group_id);
                expect(row).to.have.property('id');
              });
          });
      }); //it happy path
    }); //context happy path
  }); //Describe POST /api/player
  describe('Delete /api/players/group_id/player_id', ()=>{
    beforeEach('seed users table', () => {
      return helpers.seedUsersTable(db, testUsers);
    });
    beforeEach('seed groups table', () => {
      return helpers.seedGroupsTable(db, testGroups);
    });
    beforeEach('seed players table', () => {
      return helpers.seedPlayersTable(db, testPlayers);
    });
    it('responds 204 with and deletes the player',()=>{
      const expected = testPlayers.filter(player => player.id !== 1);
      return supertest(app)
        .delete('/api/players/1/1')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(204)
        .expect(()=>{
          db('even_teams_players')
            .select('*')
            .then(rows=>{
              expect(rows).to.eql(expected);
            });
        });
    });
  });//describe delete
}); //main describe
