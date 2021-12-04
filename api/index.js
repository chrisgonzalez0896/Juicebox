const express = require('express');
const apiRouter = express.Router();

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;



// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');


  //RIGHT NOW WORKING ON LAST STEP OF 'GIVING THEM  A TOKEN'
  //NOTES:
  // it appears every post request is not getting the
  // correct prefix+auth maybe? b/c the if and else if
  // both don't run but the else does
  // but it works in the terminal making request, just
  // not the server terminal
  // happens right above these comments?
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {

      const { id } = jwt.verify(token, JWT_SECRET);
      console.log("id: ", id)
      if (id) {
        console.log("id: ", id)
        req.user = await getUserById(id);
        console.log("req.user first instance: ", req.user)
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
  }
});

apiRouter.use((req, res, next) => {
  console.log('req.user: ', req.user)
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});


const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter)

apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message
  });
});


module.exports = apiRouter;


