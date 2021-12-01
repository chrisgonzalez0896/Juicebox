const {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getPostsByUser,
    getUserById,
    createTags,
    createPostTag,
    addTagsToPost,
    getPostById,
    getAllPosts
} = require('./index');

async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
  
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
    //   await addTagsToPost(postTwo.id, [sad, inspo]);
    //   await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags: ", error);
      throw error;
    }
  }

async function dropTables() {
    try {
      console.log("Starting to drop tables...");
  
      // have to make sure to drop in correct order
      await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
  
      console.log("Finished dropping tables!");
    } catch (error) {
      console.error("Error dropping tables!");
      throw error;
    }
  }

//   tags

//   id, SERIAL PRIMARY KEY
//   name, VARCHAR(255) UNIQUE NOT NULL
//   post_tags
  
//   "postId", INTEGER REFERENCES posts(id)
//   "tagId", INTEGER REFERENCES tags(id)
//   Add a UNIQUE constraint on ("postId", "tagId")


async function createTables() {
    try {
        console.log("Starting to build tables...");

        await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
      `);

      await client.query(`
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
      `);

      await client.query(`
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
      `);

      await client.query(`
      CREATE TABLE post_tags (
          "postId" INTEGER REFERENCES posts(id) UNIQUE,
          "tagId" INTEGER REFERENCES tags(id) UNIQUE
      );
    `);
      
        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error;
    }
}

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'albert', location: 'Joliet' });

        console.log(albert);

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPost({
        id: 1,
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them."
      });
  
      // a couple more
    } catch (error) {
      throw error;
    }
  }
// then modify rebuildDB to call our new function
async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      
      await createTables();
      console.log("createTables worked")
      await createInitialUsers();
      console.log("createInitialUsers worked")
      await createInitialPosts();
      console.log("createInitialPosts worked")
      await createInitialTags();
      console.log("createInitialTags worked")
    } catch (error) {
      console.log("Error during rebuildDB")
      throw error;
    }
  }

async function testDB() {
    try {
      console.log("Starting to test database...");
  
      console.log("Calling getAllUsers")
      const users = await getAllUsers();
      console.log("Result:", users);

      console.log("Calling createPost")
      const posts = await createPost({ id: 1, authorId: 1, title: 'title here', content: 'content here' });
      console.log("Result:", posts);

      console.log('Calling updatePost')
      const updatedPostResult = await updatePost(1, { title: 'new title', content: 'new content' });
      console.log("Result:", updatedPostResult);

      console.log("Calling getPostByUser")
      const userPosts = await getPostsByUser(1);
      console.log("Result:", userPosts)

      console.log("Calling createTags")
      const tags = await(createTags(["#tag1", "#tag2"]));
      console.log("Result: ", tags)

      console.log("Calling getUserById")
      const userPostsWithUserInfo = await getUserById(1);
      console.log("Result:", userPostsWithUserInfo)
  
      console.log("Calling updateUser on users[0]")
      const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);
  
      console.log("Finished database tests!");
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    }
  }


rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());