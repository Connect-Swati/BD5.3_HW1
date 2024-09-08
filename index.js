//npm install express sequelize sqlite3
let express = require("express");
let app = express();
// Add middleware to parse request body as JSON
app.use(express.json());
let port = 3000;
// Import the Post model and Sequelize instance from the previously defined paths
let Post = require("./models/post.model");
let { sequelize_instance } = require("./lib/index");
app.listen(port, () => {
  console.log("Server is running on port " + port);
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "BD5.2 - HW1" });
});

let postData =[
  {
    title: 'Getting Started with Node.js',
    content:
      'This post will guide you through the basics of Node.js and how to set up a Node.js project.',
    author: 'Alice Smith',
  },
  {
    title: 'Advanced Express.js Techniques',
    content:
      'Learn advanced techniques and best practices for building applications with Express.js.',
    author: 'Bob Johnson',
  },
  {
    title: 'ORM with Sequelize',
    content:
      'An introduction to using Sequelize as an ORM for Node.js applications.',
    author: 'Charlie Brown',
  },
  {
    title: 'Boost Your JavaScript Skills',
    content:
      'A collection of useful tips and tricks to improve your JavaScript programming.',
    author: 'Dana White',
  },
  {
    title: 'Designing RESTful Services',
    content: 'Guidelines and best practices for designing RESTful APIs.',
    author: 'Evan Davis',
  },
  {
    title: 'Mastering Asynchronous JavaScript',
    content:
      'Understand the concepts and patterns for writing asynchronous code in JavaScript.',
    author: 'Fiona Green',
  },
  {
    title: 'Modern Front-end Technologies',
    content:
      'Explore the latest tools and frameworks for front-end development.',
    author: 'George King',
  },
  {
    title: 'Advanced CSS Layouts',
    content:
      'Learn how to create complex layouts using CSS Grid and Flexbox.',
    author: 'Hannah Lewis',
  },
  {
    title: 'Getting Started with React',
    content: 'A beginners guide to building user interfaces with React.',
    author: 'Ian Clark',
  },
  {
    title: 'Writing Testable JavaScript Code',
    content:
      'An introduction to unit testing and test-driven development in JavaScript.',
    author: 'Jane Miller',
  },
]


// end point to see the db
app.get("/seed_db", async (req, res) => {
  try {
    // Synchronize the database, forcing it to recreate the tables if they already exist

    await sequelize_instance.sync({ force: true });
    // Bulk create entries in the book table using predefined data

    // self study
    /*
    capture the result of the bulkCreate method, which returns an array of the created instances
    */

    let insertedPost = await Post.bulkCreate(postData);
    // Send a 200 HTTP status code and a success message if the database is seeded successfully
    res.status(200).json({
      message: "Database Seeding successful",
      recordsInserted: insertedPost.length,
    }); // Displays the number of post inserted
  } catch (error) {
    // Send a 500 HTTP status code and an error message if there's an error during seeding

    console.log("Error in seeding db", error.message);
    return res.status(500).json({
      code: 500,
      message: "Error in seeding db",
      error: error.message,
    });
  }
});

/*
Exercise 1: Fetch all posts

Create an endpoint /posts that’ll return all the posts in the database.

Create a function named fetchAllPosts to query the database using the sequelize instance.

API Call

http://localhost:3000/posts

Expected Output:

{
  posts: [
    // All post entries in the database
  ],
}

*/
//fucntion to fetch all posts
async function fetchAllPosts() {
  try {
    let allPosts = await Post.findAll();
    if (!allPosts || allPosts.length == 0) {
      throw new Error("No posts found");
    }
    return { posts: allPosts };
  } catch (error) {
    console.log("Error in fetching all posts", error.message);
    throw error;
  }
}

//endpoint to fetch all posts
app.get("/posts", async (req, res) => {
  try {
    let allPosts = await fetchAllPosts();
    return res.status(200).json(allPosts);
  } catch (error) {
    if (error.messaage === "No posts found") {
      return res.status(404).json({
        code: 404,
        message: "No posts found",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Error in fetching all posts",
        error: error.message,
      });
    }
  }
});

/*
Exercise 2: Add a new post in the database

Create a POST endpoint /posts/new that’ll return the newly inserted post details.

Declare a variable named newPost to store the request body data AKA req.body.newPost.

Create a function named addNewPost that’ll insert the new post into the database and return the new post record from the database.

API Call

http://localhost:3000/posts/new

Request Body:

{
    'newPost': {
        "title": "Introduction to Sequelize",
        "content": "This post explains how to use Sequelize ORM for Node.js."",
        "author": "John Doe"
    }
}

Expected Output:

{
    'newPost': {
        'id': 11,
        'title': 'Introduction to Sequelize',
        'content': 'This post explains how to use Sequelize ORM for Node.js.',
        'author': 'John Doe'
    }
}
     */

// function to Add a new post in the database
async function addNewPost(newPost) {
  try {
    let result = await Post.create(newPost);
    if (!result) {
      throw { message: "Failed to create new post" }; // Standardized error response
    }
    return { newPost: result };
  } catch (error) {
    console.log("Error in adding new post", error.message);
    throw { message: "Error in adding new post", error: error.message }; // Standardized error response
  }
}

// Endpoint to add a new post
app.post("/posts/new", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    if (!req.body.newPost) {
      throw { message: "Invalid request body" }; // Validate request body
    }
    let newPost = req.body.newPost;
    let result = await addNewPost(newPost);
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error in adding new post", error.message);
    if (error.message === "Failed to create new post") {
      return res.status(404).json({
        code: 404,
        message: "Failed to create new post",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Error in adding new post",
        error: error.message,
      });
    }
  }
});
/*
Exercise 3: Update post information

Create a POST endpoint /posts/update/:id that’ll return the updated post details.

Declare a variable named id to store the path parameter passed by the user.

Declare a variable named newPostData to store the request body data.

Create a function named updatePostById that’ll update the post in the database and return the updated post record from the database.

API Call

http://localhost:3000/posts/update/11

Request Body:

{
  'title': 'Advanced Sequelize'
}

Expected Output:

{
    'message': 'Post updated successfully',
    'updatedPost': {
        'id': 11,
        'title': 'Advanced Sequelize',
        'content': 'This post explains how to use Sequelize ORM for Node.js.',
        'author': 'John Doe'
    }
}
     */

// fucntion to  Update post information
async function updatePostById(id, newPostData) {
  try {
  let  result = await Post.update(newPostData, {
    where: { id: id }
  });

    // Sequelize's update() returns an array where:
    // result[0] is the number of rows that were updated.
    if (result[0] === 0) {
      // If no rows were updated (result[0] is 0), it means no post was found with the given id
      throw new Error("No Post found");
    }

    // To return the updated post details, we query the updated post using the id
    let updatedPost = await Post.findByPk(id); // This retrieves the updated post by its id

    // Return the updated post details along with a success message
    return {
      message: "Post updated successfully",
      updatedPost: updatedPost, // Send the updated post details
    };
  } catch (error) {
    console.log("error in updating post", error.message);
    throw error;
  }
}



// Endpoint to update post
app.post("/posts/update/:id", async (req, res) => {
  try {
    // Extract the id from the request parameters and convert it to an integer
    let id = parseInt(req.params.id);

    // Extract the updated post data from the request body
    let newPostData = req.body;

    // Call the updatePostById function and pass the id and new post data
    let result = await updatePostById(id, newPostData);

    // Send a 200 status code with the updated post details as JSON
    return res.status(200).json(result);
  } catch (error) {
    // If no post were found, send a 404 response
    if (error.message === "No Post found") {
      return res.status(404).json({
        code: 404,
        message: "No post found",
        error: error.message,
      });
    } else {
      // For other errors, send a 500 internal server error response
      return res.status(500).json({
        code: 500,
        message: "Error in updating post",
        error: error.message,
      });
    }
  }
});
/**
 * Exercise 4: Delete a post from the database

Create a POST endpoint /posts/delete that’ll delete the post record from the database.

Declare a variable named id to store the parameter from request body.

Create a function named deletePostById that’ll delete the post record from the database based on the post id.

API Call

http://localhost:3000/posts/delete

Request Body:

{
	'id': 11
}

Expected Output:

{ 'message': 'Post record deleted successfully' }

 */

// function to delete Post from db
async function deletePostById(id) {
  try {
    // Attempt to destroy the Post based on the given id
    let result = await Post.destroy({ where: { id: id } });

    // If result equals 0, that means no Post was found with the given id
    if (result === 0) {
      throw new Error("No Posts found"); // Custom error message for no records found
    }

    // Return a success message if the Post was deleted
    return { message: "Post record deleted successfully" };
  } catch (error) {
    // Log the error and rethrow it for further handling in the calling function
    console.log("Error in deleting Post", error.message);
    throw error;
  }
}

// Endpoint to delete Post
app.post("/Posts/delete", async (req, res) => {
  try {
    // Log the request body for debugging purposes
    console.log("Request body:", req.body);

    // Parse the id from the request body
    let id = parseInt(req.body.id);

    // Call the function to delete the Post by id and wait for the result
    let result = await deletePostById(id);

    // Return a 200 status code with the result if successful
    return res.status(200).json(result);
  } catch (error) {
    // Handle the case where no Posts were found for the given id
    if (error.message === "No Posts found") {
      return res.status(404).json({
        code: 404,
        message: "No Posts found",
        error: error.message,
      });
    } else {
      // Handle other server-side errors
      return res.status(500).json({
        code: 500,
        message: "Error in deleting Post",
        error: error.message,
      });
    }
  }
});