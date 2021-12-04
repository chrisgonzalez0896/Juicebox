const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Require the jsonwebtoken package, store it in a constant jwt

const { getAllUsers, getUserByUsername, createUser } = require('../db');

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();
  
    res.send({
      users
    });
  });

  usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {

        // Sign an object (something like jwt.sign({/* user data */}, process.env.JWT_SECRET)) with both the id and username from the user object with the secret in process.env.JWT_SECRET
// Add a key of token, with the token returned from step 2, to the object passed to res.send()
        //const objectToPass = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET, { expiresIn: '24h'})
        // create token & return to user
        //console.log("USER TOKEN: ", userToken)
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.send({ message: "you're logged in!" , token: token});
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

  usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }
  
      const user = await createUser({
        username,
        password,
        name,
        location,
      });
  
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "thank you for signing up",
        token 
      });
    } catch ({ name, message }) {
      next({ name, message })
    } 
  });

module.exports = usersRouter;