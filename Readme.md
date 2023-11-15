[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/GzEM5E6_)
## Assignment: Building a Blogging Platform API
Scenario: You have been assigned to develop a backend API for a blogging platform. The API will handle CRUD operations for blog posts and user management. The platform should be secure, scalable, and follow best practices for performance and reliability.

## Instructions:
### Set up the project:
Initialize a new Node.js project using the TypeScript template.
Install necessary dependencies such as Express, MongoDB, Mongoose, Socket.IO, etc.
### User Management:
Implement user registration,  login, and authentication using JWT.
Create RESTful routes for managing user accounts (create, read, update, delete).
Apply appropriate authorization middleware to secure sensitive routes.
### Blog Post Management:
Design the database schema for blog posts using Mongo.
Create RESTful routes for managing blog posts (create, read, update, delete).
Implement pagination and sorting for retrieving blog posts.
Apply authentication and authorization to ensure only authorized users can create/update/delete posts. Any logged in user can create a blog, but only the creator can update or delete the blog. 
### Data Persistence:
Set up a MongoDB database using Mongoose.
Implement data models and relationships for users and blog posts.
Use Mongoose ORM for interacting with the database.
Error Handling and Logging:
Implement error handling middleware to catch and handle exceptions.
Log errors and application events using a logging library like Winston Or any other library.
 
### Asynchronous Communication:
Integrate RabbitMQ for handling asynchronous communication.
Implement a queue system for processing tasks asynchronously, such as sending email notifications for new blog comments.


##### Note: 
you don't need to implement email functionality, just write another console application that listens to RabbitMQ queue and logs out the information when a new message comes in.

### Clustering and Scaling:
Implement clustering using the Cluster module to utilize multiple CPU cores.
Set up a load balancer to distribute incoming requests across multiple instances of the API.
