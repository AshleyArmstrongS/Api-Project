//Holds the APP_SECRET DB name and other information that may change between development and production
const APP_SECRET = "OptiFarmSecret"; //Used for generating the JWT and authenticating users
const atlasURI =
  "mongodb+srv://optiOne:oneOpti@cluster0.ikcii.mongodb.net/OptiFarmTestDb?retryWrites=true&w=majority"; //Connection to the mongodb database hosted on atlas
const atlasOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  poolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};
const apiOptions = {
  port: 4000,//port the API can be found on
  endpoint: "/optiFarm",//Url of the API
};
module.exports = {
  atlasURI,
  atlasOptions,
  APP_SECRET,
  apiOptions,
};
