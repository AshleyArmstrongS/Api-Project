const mongoose = require("mongoose");
const { atlasURI, atlasSettings } = require("./Config");

mongoose
  .connect(atlasURI, atlasSettings)
  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.log(err));
