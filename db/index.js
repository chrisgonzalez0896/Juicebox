const { Client } = require('pg'); // imports the pg module

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/postgres');


async function getAllUsers() {
    const { rows } = await client.query(
      `SELECT id, username, name, location, active 
      FROM users;
    `);
  //      console.log("log here",rows)
    return rows;
  }

  async function createUser({ 
    username, 
    password,
    name,
    location
  }) {
    try {
      const { rows: [user] } = await client.query(`
        INSERT INTO users(username, password, name, location) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
      `, [username, password, name, location]);
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ user ] } = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function createPost({ 
    id,
    authorId,
    title,
    content
  }) {
    try {
      const { rows: [posts] } = await client.query(`
        INSERT INTO posts(id, "authorId", title, content) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
      `, [id, authorId, title, content]);
      // console.log('posts here')
      return posts;
    } catch (error) {
      throw error;
    }
  }

  async function updatePost(id, fields = {}) {

    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  

    try {

      const { rows: [ post ] } = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return post;
  
    } catch (error) {
      throw error;
    }
  }

  async function getPostsByUser(userId) {
    try {
      const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };   
      `);
  
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async function getUserById(userId) {
    try {
      const { rows } = await client.query(`
        SELECT * 
        FROM users
        WHERE id=${userId};   
      `);

      if(rows){
        delete rows[0].password;
        rows.posts = await getPostsByUser(userId);
        return rows;
      } else{
        return null;
      }
  
      
    } catch (error) {
      throw error;
    }
  }

  // async function getUserById(userId) {

  //   let userInfoWithPosts = null;

  //   try{
      
  //   const { abc } = await client.query(`
  //   SELECT * FROM users;
  //   `);
       
  //   console.log(abc);
  //   // if(userInfo){

  //   //   delete userInfo.password;

  //   //   const allUserPosts = getPostsByUser(userId);

  //   //   userInfoWithPosts = allUserPosts;
  //   // }
  //     // return userInfoWithPosts;

  //     return abc;
  //   } catch(error){
  //     throw error;
  //   }
  //   // first get the user (NOTE: Remember the query returns 
  //     // (1) an object that contains 
  //     // (2) a `rows` array that (in this case) will contain 
  //     // (3) one object, which is our user.
  //   // if it doesn't exist (if there are no `rows` or `rows.length`), return null
  
  //   // if it does:
  //   // delete the 'password' key from the returned object
  //   // get their posts (use getPostsByUser)
  //   // then add the posts to the user object with key 'posts'
  //   // return the user object
  // }
  
  // and export them
  module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getPostsByUser,
    getUserById
  }