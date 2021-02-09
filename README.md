# This is the OptiFarm API

## Setup

---

**Installs**<br  />
npm install graphql-yoga <br  />
npm install mongoose <br />
npm install --save graphql-scalars <br />
npm install jsonwebtoken bcryptjs <br />

**Other setup<br  />**
Create Config.js in src.<br  />
Populate with Config.sample and update the values to include a suitable Atlas db API url and APP secret. </br>Other details can be updated as desired.

## Using the API

---

**Run the API**


To Run the API, open a terminal and enter "node src/index.js"

**Test it**

Once you have the API running you can open up a browser go to the url "http://localhost:4000/"

You will be presented with a screen that looks like this:

![playground](https://cdn.discordapp.com/attachments/694874903584833546/808441264860430336/Screenshot_173.jpg)

**Playground**

This is graphql playground. It allows you to use the API without the need of a client. Its a great tool to help understand the API.

The Docs and Schema tabs are also useful for helping you understand what functionality the API provides.

## Testing

---

Our testing has been done in Postman. This Button will take you to the testing site where you can create an account and have a look.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/660af285d8dc16ca17e7)

## Mongoose Schema Validation

---

Included in the schema for the database is mongoose schema types and using some functions with regex to validate what the user has entered is in an acceptable format.
If you would like to take a look at the schemas then head to src/models folder, you can see them there. The "mongoose_validation.js" contains the validation functions that was created to be used in the validate schema type.
