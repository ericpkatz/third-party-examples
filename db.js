const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const moment = require('moment');

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_auth_db');

client.connect();

const sync = async()=> {
  const SQL = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  DROP TABLE IF EXISTS events;
  DROP TABLE IF EXISTS users;
  CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    CHECK (char_length(username) > 0),
    lat DECIMAL,
    lng DECIMAL
  );
  CREATE TABLE events(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES users(id),
    name VARCHAR(100),
    "startTime" TIMESTAMP NOT NULL
  );
  `;
  await client.query(SQL);
  const [moe, lucy, curly] = await Promise.all([
    createUser({ username: 'moe', password: 'MOE', lat: 40.748440, lng: -73.985664}),
    createUser({ username: 'lucy', password: 'LUCY', lat: 36.106964, lng: -112.112999}),
    createUser({ username: 'curly', password: 'CURLY', lat: 41.878113, lng: -87.629799})
  ]);

  await Promise.all([
    createEvent({ userId: moe.id, name: 'Birthday', startTime: moment().add(1, 'day').toDate() }),
    createEvent({ userId: moe.id, name: 'Date with Lucy', startTime: moment().add(7, 'day').toDate() })
  ])

  return {
    lucy, moe, curly
  };
};

const compare = ({ plain, hashed })=> {
  return new Promise((resolve, reject)=> {
    bcrypt.compare(plain, hashed, (err, success)=> {
      if(err){
        return reject(err);
      }
      if(success){
        return resolve();
      }
      reject({ message: 'bad password'});

    });
  });
};

const getUserFromToken = async(token)=> {
  const id = jwt.decode(token, process.env.JWT).id;
  const user = (await client.query('SELECT * FROM users WHERE id=$1', [ id ])).rows[0]; 
  return user;
};

const authenticate = async({ username, password })=> {
  const user = (await client.query('SELECT * FROM users WHERE username=$1', [ username])).rows[0]; 
  await compare({ plain: password, hashed: user.password });

  return jwt.encode({ id: user.id}, process.env.JWT);
};

const createUser = async({ username, password, lat, lng })=> {
  const hashed = await hash(password);
  return (await client.query('INSERT INTO users(username, password, lat, lng) values ($1, $2, $3, $4) returning *', [ username, hashed, lat, lng])).rows[0];
};

const getEvents = async(userId)=> {
  return (await client.query('SELECT * FROM events WHERE "userId" = $1', [ userId ])).rows;
};

const getUsers = async(userId)=> {
  return (await client.query('SELECT * FROM users')).rows;
};

const createEvent = async({ userId, name, startTime })=> {
  return (await client.query('INSERT INTO events("userId", name, "startTime") values ($1, $2, $3) returning *', [ userId, name, startTime])).rows[0];
};

//TODO
const hash = (plain)=> {
  return new Promise((resolve, reject)=> {
    bcrypt.hash(plain, 10, (err, hashed)=> {
      if(err){
        return reject(err);
      }
      return resolve(hashed);
    });
  });
};


module.exports = {
  createEvent,
  sync,
  authenticate,
  getUserFromToken,
  getEvents,
  getUsers
};
