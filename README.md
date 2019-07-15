# Even-Teams Server

This is a server to deliver user, group and player information to the front end web app that can be found here. (https://github.com/DustinHaefele/even-teams-client).

## Getting Started

Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
`cd` into the cloned repository
Make a fresh start of the git history for this project with `rm -rf .git && git init`
Install the node dependencies `npm install`

### Prerequisites

The database side was builh]t with postgresql and will need to be installed on your machine to work effectively as written.  A tutorial on how to install can be found here (https://www.postgresql.org/docs/9.3/tutorial-install.html) 

### Installing

To get this up and running for development the first thing you will need to do is to run 

```
npm install
```

You will need to create a postgresql database.  You can find out how here (https://www.postgresql.org/docs/9.0/sql-createdatabase.html)



Next you will need to create a .env file with the following definitions

```
NODE_ENV=development
PORT=8000
MIGRATION_DB_HOST=localhost
MIGRATION_DB_PORT=5432
MIGRATION_DB_NAME=create-a-db-and-put-it-here
MIGRATION_DB_USER=put-your-db-username-here
MIGRATION_DB_PASS=put-your-db-password-here
DB_URL="put-your-db-url-here"
JWT_SECRET=put-a-256-bit-secret-token-here
JWT_EXPIRY='put-an-expiry-time-here'
```

Finally you can run migrations to create all the necessary tables with 

```
npm run migrate
```

in the app.js file you can take a look at all the routes that you can use to request info from the database with. 

## Running the tests

There are 42 tests that run when you run 

```
npm test
```

### Break down into end to end tests

These tests are in place to make sure that the server is responding correctly to both happy path requests as well as sending the correct error codes and messages when it recieves an invalid request. 

Testing is completed with mocha, chai, and supertest.

## Deploying

When your new project is ready for deployment, add a new Heroku application with heroku create. This will make a new git remote called "heroku" and you can then npm run deploy which will push to this remote's master branch


## Built With

* [Postgresql](https://www.postgresql.org/docs/9.0/) - The database manager used
* [Express](https://expressjs.com/en/5x/api.html) 
* [Nodejs](https://nodejs.org/en/)
* [knex](https://knexjs.org/)
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)


## Authors

* **Dustin Haefele** 

