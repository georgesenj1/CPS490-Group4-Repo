# TABLE OF CONTENTS
1. [High Level Overview](#high-level-overview)
    - [HTML | Javascript | CSS | PUG](#html--javascript--css--pug)
    - [Node.js](#nodejs)
    - [Express](#express)
    - [MongoDB](#mongodb)
    
2. Class Examples
    - [Tech Primer I](#tech-primer-i)
    - [Tech Primer II](#tech-primer-ii)
    - [Tech Primer III](#tech-primer-iii)
    - [Databases I](#database-i)
    - [Databases I](#database-ii)
    - [Cookies/Sessions](#cookiessessions)
    - [Authentication](#authentication)

# High Level Overview

## HTML | Javascript | CSS | PUG
HTML (Hypertext Markup Language), CSS (Cascading Style Sheets), and JavaScript are languages that make up modern web development. They all work together to create web applications. HTML provides the backbone and structure to the page. It outlines the headings, paragraphs, images, links, and more. CSS brings the style to the webpage, it is used to define the layout, colors, fonts, and positioning of HTML elements. JavaScript is used to add interactivity to the web pages. It can manipulate the Document Object Model (DOM) to change the content and apperance of the webpage. The combination of these three tools allows for web developers to create powerful modern web-applications.

Pug is a template engine for HTML. It plays a role in simplifying the process of generating HTML markup by using much more readable syntax. Pug templates provide a way to structure the layout of web pages more efficiently and maintainably. JavaScript can be used to interact with Pug templates. Pug complements HTML, CSS, and JavaScript by bettering the templating process and making it easier for developers to create and manage the structure of web pages in a clean and organized manner.

## Node.js
Node.js is a runtime environment that allows for the executecution of JavaScript outside the web browser. It was created by Ryan Dahl in 2009 and has become very popular. It has a non-blocking, event-driven architecture, allowing the ability to build extensive network applications. Node.js utilizes Google's V8 JavaScript engine, which is the same one that runs on Chrome.

Another big plus to Node.js is Node Package Manager (NPM). NPM allows for developers to access a wide range of libraries to extend the functionality of their applications. The combination of NPM and JavaScript has been one of the leading causes to Node.js' popularity. These tools can be used to creating web servers and real-time applications to building command-line tools and desktop applications.

## Express
Express.js, is a web application framework for Node.js. It was created to simplify the process of building web applications and APIs by providing a features and tools for web development. Developed by TJ Holowaychuk and released in 2010, Express has since become one of the most widely used web frameworks in the Node.js ecosystem.

Express simplifies the process of creating web applications by offering a straightforward structure. It provides a variety of built-in features for routing, handling HTTP processes, and working with middleware. This flexibility makes it easy to add custom logic, authentication, and other functionality to an application. Express also has an active community and a lot of plugins. Express is a good tool for building both small-scale applications and large.


## MongoDB
MongoDB is a popular and open-source NoSQL database. It was first developed by the company 10gen and was released in 2009. MongoDB is a document-oriented database, meaning it stores data in JSON-like documents. Unlike traditional relational databases such as SQL databases, MongoDB doesn't use tables, giving developers the freedom to work with unstructured or semi-structured data.

One of MongoDB's best features is its horizontal scalability, this allows the database to stor huge amounts of data while still being very fast. This makes it an excellent choice for applications with rapidly changing structures of data or projects that will keep getting larger and larger. MongoDB's query language and indexing capabilities are also very powerful. The database can also be connected to many different programming languages and environments, adding to its' capabilites and making it a popular choice for many developers.

# Class Examples

## Tech Primer I
In this sections, we started to set up and installed Node.js and its' package manager, NPM. We also wrote our first HelloWorld program that can be found [here](/expressTest/HelloWorld.js). This program was the simplest Node.js application we could make. All it does is create an HTTP server on the localhost's port 3000 and output that it is running.

## Tech Primer II
This is where we started to get more going on. We installed Express and improved our HelloWorld example. Now we can go to the localhost on port 3000 and see a webpage displaying "Hello World!". We also had a [routes](/expressTest/routes.js)/[router](/expressTest/router.js) example that showed off how routing works in Express, we will use this to make multi-page applications and utilizing HTTP methods. There is also a [dynamic routes](/expressTest/dynamic-route.js) example, that shows off how we can use HTTP methods to create dynamic routes. A regex routing example can be found [here](/expressTest/regex-route.js), this allows for restriction of URL parameter matching. This [file](/expressTest/404-example.js) shows off how we can gracefully handle 404 errors. Middleware functions are functions that sit between different parts of a software system, acting as intermediaries to handle various tasks, such as processing requests, modifying data, or enforcing security measures. This is an introduction [example](/expressTest/middleware-intro.js) to middleware. This is middleware order [example](/expressTest/middleware-order.js).

## Tech Primer III
In this tech primer, we set up PUG. It is a very simple technology to understand, all it does is template HTML. It is super readable and understandable. [Here](/expressTest/pug-values-from-template.js) is an example of passing values from a route handler to [pug templates](/expressTest/views/dynamic.pug). Different PUG files can also be imported into another PUG file. For example, [here](/expressTest/views/content.pug) we are importing a [header](/expressTest/views/header.pug) and a [footer](/expressTest/views/footer.pug). You can also serve static files in PUG, [Javascript file](/expressTest/static-index.js)/[PUG file](/expressTest/views/static.pug). In this primer we also had our first mock-up of building a form. The JavaScript is [here](/expressTest/form-index.js) and it is using the PUG files [here](/expressTest/views/form.pug)

## Database I
In this section we set up MongoDB. I also followed a tutorial to connect it to Visual Studio Code. We also installed Mongoose through NPM and used it to connect our JavaScript to MongoDB. This was just an intropduction and setup tutorial, no code was written in this notes section.

## Database II
In this section we established a simple connection to MongoDB in JavaScript. Then we build on this script and created a simple form that added a "Pet" model to the database. Then we added a POST route handler (this is when the button is clicked). After that we learned how to retrieve from Mongo. The JavaScript is [here](/expressTest/pet-example.js) and the PUG files are [pet file](/expressTest/views/pet.pug), [show message](/expressTest/views/show_message.pug), and [show all](/expressTest/views/show_all.pug)

## Cookies/Sessions
In this section we learned how to handle cookies and sessions. We NPM installed the "cookie-parser" package and wrote a simple script that puts a cookie into the user's browser and then we learned how to see that cookie using the "Inspect Element" button. The code is [here](/expressTest/cookie-example.js). After that we learned about sessions in Express. We NPM installed the package "express-sessions.js". A session is a server-side mechanism that enables the storage and management of user-specific data and state during a user's interaction with a website or web application, using a unique session ID and often facilitated by session cookies. Then we wrote a simple script that outputs the number of times the user has visited that page of the site. The code is [here](/expressTest/session-example.js).

## Authentication
In this section we covered what it will take to authenticate a user. This will require a sign-up page and a sign-in page. It is not too complicated and the code explains what is going on better than I can here. The JavaScript code is [here](/expressTest/simple-auth.js) and the PUG sign-up is [here](/expressTest/views/signup.pug) and the PUG login code is [here](/expressTest/views/login.pug). This code is bad because it stores plain-text passwords which is a huge security risk.