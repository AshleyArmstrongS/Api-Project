const mongoose = require("mongoose");
const { atlasURI, atlasSettings } = require("./Config");

mongoose
  .connect(atlasURI, atlasSettings)
  .then(() => {
    console.log("MongoDB Connectedâ€¦");
  })
  .catch((err) => console.log(err));
