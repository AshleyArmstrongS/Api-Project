# This is the OptiFarm API

## Setup

---

**Installs**<br  />
npm install graphql-yoga <br  />
npm ci

**Other setup<br  />**
Create Config.js in src.<br  />
Populate with Config.sample and update the values to include a suitable Atlas db API url and APP secret. </br>Other details can be updated as desired.

## Using the API

---

**Run the API**

To Run the API, open a terminal and enter "npm start"

**Test it**

Once you have the API running you can open up a browser go to the url "http://localhost:4000/"

You will be presented with a screen that looks like this:

![playground](https://cdn.discordapp.com/attachments/694874903584833546/808441264860430336/Screenshot_173.jpg)

**Playground**

This is graphql playground. It allows you to use the API without the need of a client. Its a great tool to help understand the API.

![playground](https://cdn.discordapp.com/attachments/694874903584833546/809758139184447518/Screenshot_186.png)

The Docs and Schema tabs are also useful for helping you understand what functionality the API provides.

Within the docs you can select a query or mutation. from here you can see the response and get information on those responses.

## Testing

---

Our testing has been done in Postman. This Button will take you to the testing site where you can create an account and have a look.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/13681131-eb1e8bdd-bc7d-434f-900c-02200c778c23?action=collection%2Ffork&collection-url=entityId%3D13681131-eb1e8bdd-bc7d-434f-900c-02200c778c23%26entityType%3Dcollection%26workspaceId%3Ddb27e23f-d8e0-496b-9f76-92ad499225db)

## Mongoose Schema Validation

---

Included in the schema for the database is mongoose schema types and using some functions with regex to validate what the user has entered is in an acceptable format. This is because the format of the forms are specific and do not need to be changed, so limiting what the user can enter helps with the accuracy of the documents stored on the database.
If you would like to take a look at the schemas then head to src/models folder, you can see them there. The "mongoose_validation.js" contains the validation functions that were created to be used in the validate schema type.
